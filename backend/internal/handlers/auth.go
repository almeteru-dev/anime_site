package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginInput struct {
	Identifier string `json:"identifier"`
	Email      string `json:"email"`
	Username   string `json:"username"`
	Password   string `json:"password" binding:"required"`
}

func validatePassword(password string) error {
	if len(password) < 10 {
		return fmt.Errorf("password must be at least 10 characters long")
	}

	// Only English letters, digits, and special characters allowed
	// No Cyrillic or other non-English characters
	englishOnly := regexp.MustCompile(`^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$`)
	if !englishOnly.MatchString(password) {
		return fmt.Errorf("password must only contain English letters, digits, and special characters")
	}

	hasUppercase := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUppercase {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}

	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasDigit {
		return fmt.Errorf("password must contain at least one digit")
	}

	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	if !hasSpecial {
		return fmt.Errorf("password must contain at least one special character")
	}

	return nil
}

func generateToken(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := validatePassword(input.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Role:         "user",
		IsVerified:   false,
	}

	if err := app.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or Username already exists"})
		return
	}

	// Generate verification token
	token := generateToken(32)
	if token == "" {
		log.Printf("failed to generate verification token bytes for user email=%s", user.Email)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}
	expiresAt := time.Now().Add(24 * time.Hour)

	vc := models.VerificationCode{
		UserID:    user.ID,
		Email:     user.Email,
		Code:      token,
		Type:      "email_verification",
		ExpiresAt: expiresAt,
	}

	if err := app.DB.Create(&vc).Error; err != nil {
		log.Printf("failed to create email verification token for user_id=%d email=%s: %v", user.ID, user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	log.Printf("Verification link for user %s: http://localhost:3000/verify-confirm?token=%s", user.Email, token)

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful. Please check your email for verification link."})
}

func VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	var vc models.VerificationCode
	if err := app.DB.Where("code = ? AND type = 'email_verification' AND expires_at > ?", token, time.Now()).First(&vc).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}

	if err := app.DB.Model(&models.User{}).Where("id = ?", vc.UserID).Update("is_verified", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify user"})
		return
	}

	app.DB.Delete(&vc)

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

func ResendVerification(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := app.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is already verified"})
		return
	}

	// Delete old verification tokens
	app.DB.Where("user_id = ? AND type = 'email_verification'", user.ID).Delete(&models.VerificationCode{})

	// Generate new token
	token := generateToken(32)
	if token == "" {
		log.Printf("failed to generate verification token bytes for resend email=%s", user.Email)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}
	expiresAt := time.Now().Add(24 * time.Hour)

	vc := models.VerificationCode{
		UserID:    user.ID,
		Email:     user.Email,
		Code:      token,
		Type:      "email_verification",
		ExpiresAt: expiresAt,
	}

	if err := app.DB.Create(&vc).Error; err != nil {
		log.Printf("failed to create email verification token for resend user_id=%d email=%s: %v", user.ID, user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	log.Printf("New verification link for user %s: http://localhost:3000/verify-confirm?token=%s", user.Email, token)

	c.JSON(http.StatusOK, gin.H{"message": "Verification email resent successfully"})
}

func ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := app.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// Don't reveal if user exists for security
		c.JSON(http.StatusOK, gin.H{"message": "If your email exists in our system, you will receive a reset link."})
		return
	}

	// Delete old reset tokens
	app.DB.Where("user_id = ? AND type = 'password_reset'", user.ID).Delete(&models.VerificationCode{})

	// Generate reset token
	token := generateToken(32)
	if token == "" {
		log.Printf("failed to generate password reset token bytes for email=%s", user.Email)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset token"})
		return
	}
	expiresAt := time.Now().Add(1 * time.Hour)

	vc := models.VerificationCode{
		UserID:    user.ID,
		Email:     user.Email,
		Code:      token,
		Type:      "password_reset",
		ExpiresAt: expiresAt,
	}

	if err := app.DB.Create(&vc).Error; err != nil {
		log.Printf("failed to create password reset token for user_id=%d email=%s: %v", user.ID, user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset token"})
		return
	}

	log.Printf("Password reset link for user %s: http://localhost:3000/reset-password?token=%s", user.Email, token)

	c.JSON(http.StatusOK, gin.H{"message": "If your email exists in our system, you will receive a reset link."})
}

func ResetPassword(c *gin.Context) {
	var input struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := validatePassword(input.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var vc models.VerificationCode
	if err := app.DB.Where("code = ? AND type = 'password_reset' AND expires_at > ?", input.Token, time.Now()).First(&vc).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	if err := app.DB.Model(&models.User{}).Where("id = ?", vc.UserID).Update("password_hash", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	app.DB.Delete(&vc)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	identifier := strings.TrimSpace(input.Identifier)
	if identifier == "" {
		identifier = strings.TrimSpace(input.Email)
	}
	if identifier == "" {
		identifier = strings.TrimSpace(input.Username)
	}
	if identifier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "identifier is required"})
		return
	}

	var user models.User
	if err := app.DB.Where("email = ? OR username = ?", identifier, identifier).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if user.IsBanned {
		reason := "No reason provided"
		if user.BanReason != nil && strings.TrimSpace(*user.BanReason) != "" {
			reason = strings.TrimSpace(*user.BanReason)
		}
		c.JSON(http.StatusForbidden, gin.H{
			"error":      fmt.Sprintf("You have been banned. Reason: %s", reason),
			"error_code": "BANNED",
			"ban_reason": reason,
		})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Please verify your email before logging in"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":       user.ID,
		"role":          user.Role,
		"token_version": user.TokenVersion,
		"exp":           time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user":  user,
	})
}

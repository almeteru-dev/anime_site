package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"github.com/seva/animevista/internal/service"
	"golang.org/x/crypto/bcrypt"
)

func publicWebBaseURL() string {
	base := strings.TrimSpace(os.Getenv("WEB_BASE_URL"))
	if base == "" {
		base = "http://localhost:3000"
	}
	return strings.TrimRight(base, "/")
}

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
	RememberMe bool   `json:"remember_me"`
}

const (
	passwordMinLength = 8
	passwordMaxLength = 100
)

func validatePassword(password string) error {
	if len(password) < passwordMinLength {
		return fmt.Errorf("password must be at least %d characters long", passwordMinLength)
	}
	if len(password) > passwordMaxLength {
		return fmt.Errorf("password must be at most %d characters long", passwordMaxLength)
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

func validateUsername(u string) error {
    if len(u) < 4 || len(u) > 30 {
        return fmt.Errorf("username must be between 4 and 30 characters")
    }
    // Только английские буквы, цифры и спецсимволы
    re := regexp.MustCompile(`^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$`)
    if !re.MatchString(u) {
        return fmt.Errorf("username contains invalid characters or cyrillic")
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
	if isRegistrationDisabled() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Registration is disabled"})
		return
	}

	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Вместо: username, err := validation.NormalizeAndValidateUsername(input.Username)
	// Напиши:
	if err := validateUsername(input.Username); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	username := strings.TrimSpace(input.Username)

	
	input.Username = username
	input.Email = strings.TrimSpace(input.Email)
	if input.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
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
		Username:     username,
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

	verificationLink := publicWebBaseURL() + "/verify-confirm?token=" + url.QueryEscape(token)
	log.Printf("Verification link for user %s: %s", user.Email, verificationLink)
	if err := service.SendVerificationEmail(user.Email, verificationLink); err != nil {
		log.Printf("failed to send verification email to %s: %v", user.Email, err)
	}

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

	verificationLink := publicWebBaseURL() + "/verify-confirm?token=" + url.QueryEscape(token)
	log.Printf("New verification link for user %s: %s", user.Email, verificationLink)
	if err := service.SendVerificationEmail(user.Email, verificationLink); err != nil {
		log.Printf("failed to resend verification email to %s: %v", user.Email, err)
	}

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

	resetLink := publicWebBaseURL() + "/reset-password?token=" + url.QueryEscape(token)
	if err := service.SendPasswordResetEmail(user.Email, resetLink); err != nil {
		log.Printf("failed to send password reset email to %s: %v", user.Email, err)
		_ = app.DB.Delete(&vc).Error
	}

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

	exp := time.Now().Add(time.Hour * 72)
	if input.RememberMe {
		exp = time.Now().Add(time.Hour * 24 * 30)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":       user.ID,
		"role":          user.Role,
		"token_version": user.TokenVersion,
		"exp":           exp.Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	ck := &http.Cookie{
		Name:     "auth_token",
		Value:    url.QueryEscape(tokenString),
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Secure:   c.Request.TLS != nil,
	}
	if input.RememberMe {
		ck.MaxAge = 60 * 60 * 24 * 30
	}
	http.SetCookie(c.Writer, ck)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user":  user,
	})
}

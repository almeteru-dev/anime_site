package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// GetProfile fetches the user's profile information
func GetProfile(c *gin.Context) {
	userID := c.Param("userId")
	var user models.User

	if err := app.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetMe fetches the current logged-in user's profile
func GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var user models.User
	if err := app.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateAge updates the user's age
func UpdateAge(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Age int `json:"age" binding:"required,min=1,max=120"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := app.DB.Model(&models.User{}).Where("id = ?", userID).Update("age", input.Age).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update age"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Age updated successfully"})
}

// UpdatePassword updates the user's password
func UpdatePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=10"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := app.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.CurrentPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid current password"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	if err := app.DB.Model(&user).Update("password_hash", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// Email Change Handlers

func generateCode() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

func RequestOldEmailCode(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := app.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Email != input.Email {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect current email"})
		return
	}

	code := generateCode()
	expiresAt := time.Now().Add(15 * time.Minute)

	vc := models.VerificationCode{
		UserID:    user.ID,
		Email:     user.Email,
		Code:      code,
		Type:      "old_email",
		ExpiresAt: expiresAt,
	}

	if err := app.DB.Create(&vc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code"})
		return
	}

	log.Printf("Verification code for OLD email %s: %s", user.Email, code)
	c.JSON(http.StatusOK, gin.H{"message": "Verification code sent to your current email"})
}

func VerifyOldEmailCode(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var vc models.VerificationCode
	if err := app.DB.Where("user_id = ? AND code = ? AND type = 'old_email' AND expires_at > ?", userID, input.Code, time.Now()).First(&vc).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired code"})
		return
	}

	// Code is valid, we can delete it now or just leave it to expire
	app.DB.Delete(&vc)

	c.JSON(http.StatusOK, gin.H{"message": "Current email verified"})
}

func RequestNewEmailCode(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if new email is already taken
	var count int64
	app.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already in use"})
		return
	}

	code := generateCode()
	expiresAt := time.Now().Add(15 * time.Minute)

	vc := models.VerificationCode{
		UserID:    int64(userID.(int64)),
		Email:     input.Email,
		Code:      code,
		Type:      "new_email",
		ExpiresAt: expiresAt,
	}

	if err := app.DB.Create(&vc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code"})
		return
	}

	log.Printf("Verification code for NEW email %s: %s", input.Email, code)
	c.JSON(http.StatusOK, gin.H{"message": "Verification code sent to your new email"})
}

func VerifyNewEmailCode(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var vc models.VerificationCode
	if err := app.DB.Where("user_id = ? AND code = ? AND type = 'new_email' AND expires_at > ?", userID, input.Code, time.Now()).First(&vc).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired code"})
		return
	}

	// Update user email
	if err := app.DB.Model(&models.User{}).Where("id = ?", userID).Update("email", vc.Email).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update email"})
		return
	}

	app.DB.Delete(&vc)

	c.JSON(http.StatusOK, gin.H{"message": "Email updated successfully"})
}

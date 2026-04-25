package handlers

import (
	"net/http"
	"os"
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
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
    Identifier string `json:"identifier"`
    Email      string `json:"email"`
    Username   string `json:"username"`
    Password   string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
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
	}

	if err := app.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or Username already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
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

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
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

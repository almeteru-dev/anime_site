package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminTransferRootInput struct {
	TargetUserID int64  `json:"target_user_id" binding:"required"`
	Password     string `json:"password" binding:"required"`
}

func AdminTransferRoot(c *gin.Context) {
	roleAny, _ := c.Get("role")
	role, _ := roleAny.(string)
	if role != "root" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Root access required"})
		return
	}

	requesterAny, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	requesterID := requesterAny.(int64)

	var input AdminTransferRootInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.TargetUserID == requesterID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot transfer root to self"})
		return
	}

	password := strings.TrimSpace(input.Password)
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required"})
		return
	}

	var requester models.User
	if err := app.DB.Select("id", "password_hash").First(&requester, requesterID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(requester.PasswordHash), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	var target models.User
	if err := app.DB.Select("id", "role").First(&target, input.TargetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not found"})
		return
	}
	if target.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target must be an admin"})
		return
	}

	err := app.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.User{}).Where("id = ?", target.ID).Updates(map[string]any{"role": "root"}).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.User{}).Where("id = ?", requesterID).Updates(map[string]any{"role": "admin", "token_version": gorm.Expr("token_version + 1")}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to transfer root"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Root transferred", "force_logout": true})
}

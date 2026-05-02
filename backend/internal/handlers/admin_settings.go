package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"gorm.io/gorm/clause"
)

type AdminSetDefaultPasswordInput struct {
	Password string `json:"password" binding:"required"`
}

func AdminSetDefaultPassword(c *gin.Context) {
	roleAny, _ := c.Get("role")
	role, _ := roleAny.(string)
	if role != "root" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Root access required"})
		return
	}

	var input AdminSetDefaultPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	password := strings.TrimSpace(input.Password)
	if err := validatePassword(password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setting := models.AppSetting{Key: "default_password", Value: password, UpdatedAt: time.Now()}
	if err := app.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update default password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated"})
}

func getDefaultPassword() string {
	const fallback = "AnimeVista$1"
	var s models.AppSetting
	if err := app.DB.First(&s, "key = ?", "default_password").Error; err != nil {
		return fallback
	}
	if strings.TrimSpace(s.Value) == "" {
		return fallback
	}
	return s.Value
}

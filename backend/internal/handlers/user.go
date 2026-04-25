package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
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

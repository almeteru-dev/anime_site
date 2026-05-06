package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

func GetPublicFAQ(c *gin.Context) {
	var items []models.FAQItem
	if err := app.DB.Where("is_published = true").Order("priority asc").Order("id desc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch faq"})
		return
	}
	c.JSON(http.StatusOK, items)
}


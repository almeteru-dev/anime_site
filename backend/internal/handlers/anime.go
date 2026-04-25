package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

func GetAnimes(c *gin.Context) {
	var animes []models.Anime
	// Preload Studio, Status, Source, Genres and Translations
	err := app.DB.Preload("Studio").
		Preload("Status").
		Preload("Source").
		Preload("Genres").
		Preload("Translations.Language").
		Find(&animes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch animes"})
		return
	}

	c.JSON(http.StatusOK, animes)
}

func GetAnimeByID(c *gin.Context) {
	id := c.Param("id")
	var anime models.Anime

	err := app.DB.Preload("Studio").
		Preload("Status").
		Preload("Source").
		Preload("Genres").
		Preload("Translations.Language").
		First(&anime, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
		return
	}

	c.JSON(http.StatusOK, anime)
}

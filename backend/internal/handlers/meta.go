package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

type PublicCatalogMetaResponse struct {
	Genres   []models.Genre      `json:"genres"`
	Statuses []models.Status     `json:"statuses"`
	Studios  []models.Studio     `json:"studios"`
	Sources  []models.Source     `json:"sources"`
	Ratings  []models.RatingOption `json:"ratings"`
	Kinds    []models.KindOption `json:"kinds"`
	YearMin  int                 `json:"year_min"`
	YearMax  int                 `json:"year_max"`
}

func GetPublicCatalogMeta(c *gin.Context) {
	var genres []models.Genre
	var statuses []models.Status
	var studios []models.Studio
	var sources []models.Source
	var ratings []models.RatingOption
	var kinds []models.KindOption

	if err := app.DB.Order("name asc").Find(&genres).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch genres"})
		return
	}
	if err := app.DB.Order("name asc").Find(&statuses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statuses"})
		return
	}
	if err := app.DB.Order("name asc").Find(&studios).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch studios"})
		return
	}
	if err := app.DB.Order("name asc").Find(&sources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sources"})
		return
	}
	if err := app.DB.Order("name asc").Find(&ratings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ratings"})
		return
	}
	if err := app.DB.Order("name asc").Find(&kinds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kinds"})
		return
	}

	yearMin := 1990
	yearMax := time.Now().Year()

	var minVal *int
	var maxVal *int
	app.DB.Raw(
		"SELECT MIN(EXTRACT(YEAR FROM aired_on))::int FROM anime WHERE aired_on IS NOT NULL",
	).Scan(&minVal)
	app.DB.Raw(
		"SELECT MAX(EXTRACT(YEAR FROM aired_on))::int FROM anime WHERE aired_on IS NOT NULL",
	).Scan(&maxVal)

	if minVal != nil {
		yearMin = *minVal
	}
	if maxVal != nil {
		yearMax = *maxVal
	}
	if yearMin > yearMax {
		yearMin, yearMax = yearMax, yearMin
	}

	c.JSON(http.StatusOK, PublicCatalogMetaResponse{
		Genres:   genres,
		Statuses: statuses,
		Studios:  studios,
		Sources:  sources,
		Ratings:  ratings,
		Kinds:    kinds,
		YearMin:  yearMin,
		YearMax:  yearMax,
	})
}

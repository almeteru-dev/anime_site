package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

func mapDeleteRefError(entity string, err error) string {
	if err == nil {
		return "Failed to delete " + entity
	}
	s := err.Error()
	if strings.Contains(s, "violates foreign key constraint") {
		return "Cannot delete " + entity + " (in use)"
	}
	return "Failed to delete " + entity
}

func AdminListStatuses(c *gin.Context) {
	var items []models.Status
	if err := app.DB.Order("name asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statuses"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func AdminCreateStatus(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var exists int64
	_ = app.DB.Model(&models.Status{}).Where("name = ?", name).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status already exists"})
		return
	}
	item := models.Status{Name: name}
	if err := app.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create status"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func AdminUpdateStatus(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var item models.Status
	if err := app.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Status not found"})
		return
	}
	item.Name = name
	if err := app.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update status"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func AdminDeleteStatus(c *gin.Context) {
	if err := app.DB.Delete(&models.Status{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": mapDeleteRefError("status", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func AdminListStudios(c *gin.Context) {
	var items []models.Studio
	if err := app.DB.Order("name asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch studios"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func AdminCreateStudio(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var exists int64
	_ = app.DB.Model(&models.Studio{}).Where("name = ?", name).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Studio already exists"})
		return
	}
	item := models.Studio{Name: name}
	if err := app.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create studio"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func AdminUpdateStudio(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var item models.Studio
	if err := app.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Studio not found"})
		return
	}
	item.Name = name
	if err := app.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update studio"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func AdminDeleteStudio(c *gin.Context) {
	if err := app.DB.Delete(&models.Studio{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": mapDeleteRefError("studio", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func AdminListSources(c *gin.Context) {
	var items []models.Source
	if err := app.DB.Order("name asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sources"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func AdminCreateSource(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var exists int64
	_ = app.DB.Model(&models.Source{}).Where("name = ?", name).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Source already exists"})
		return
	}
	item := models.Source{Name: name}
	if err := app.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create source"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func AdminUpdateSource(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var item models.Source
	if err := app.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Source not found"})
		return
	}
	item.Name = name
	if err := app.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update source"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func AdminDeleteSource(c *gin.Context) {
	if err := app.DB.Delete(&models.Source{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": mapDeleteRefError("source", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func AdminListGenres(c *gin.Context) {
	var items []models.Genre
	if err := app.DB.Order("name asc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch genres"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func AdminCreateGenre(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var exists int64
	_ = app.DB.Model(&models.Genre{}).Where("name = ?", name).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Genre already exists"})
		return
	}
	item := models.Genre{Name: name}
	if err := app.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create genre"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func AdminUpdateGenre(c *gin.Context) {
	var input NameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}
	var item models.Genre
	if err := app.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Genre not found"})
		return
	}
	item.Name = name
	if err := app.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update genre"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func AdminDeleteGenre(c *gin.Context) {
	if err := app.DB.Delete(&models.Genre{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": mapDeleteRefError("genre", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

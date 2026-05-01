package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"gorm.io/gorm"
)

func GetAnimeEpisodes(c *gin.Context) {
	identifier := c.Param("id")
	var animeID int64
	if parsed, err := strconv.ParseInt(identifier, 10, 64); err == nil {
		animeID = parsed
	} else {
		var anime models.Anime
		if err := app.DB.Select("id").Where("url = ?", identifier).First(&anime).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
			return
		}
		animeID = anime.ID
	}

	groupID := int64(0)
	if v := strings.TrimSpace(c.Query("group_id")); v != "" {
		n, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group_id"})
			return
		}
		groupID = n
	}

	q := app.DB.Where("anime_id = ?", animeID).Preload("VoiceGroup").Preload("VideoSources", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order asc")
	}).Order("number asc")

	if groupID != 0 {
		q = q.Where("group_id = ?", groupID)
	}

	var episodes []models.Episode
	if err := q.Find(&episodes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch episodes"})
		return
	}

	c.JSON(http.StatusOK, episodes)
}

type AdminUpsertEpisodeInput struct {
	GroupID  int64 `json:"group_id" binding:"required"`
	Number   int   `json:"number" binding:"required"`
	Duration int   `json:"duration"`
}

func AdminCreateEpisode(c *gin.Context) {
	animeIDStr := c.Param("id")
	animeID, err := strconv.ParseInt(animeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid anime id"})
		return
	}

	var input AdminUpsertEpisodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var anime models.Anime
	if err := app.DB.Select("id", "episodes").First(&anime, animeID).Error; err != nil {
		log.Printf("AdminCreateEpisode: anime not found (anime_id=%d): %v", animeID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
		return
	}
	if input.Number > anime.Episodes {
		c.JSON(http.StatusBadRequest, gin.H{"error": "episode_number exceeds anime.episodes"})
		return
	}
	if input.Number < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "episode_number must be >= 1"})
		return
	}

	var group models.VoiceGroup
	if err := app.DB.First(&group, input.GroupID).Error; err != nil {
		log.Printf("AdminCreateEpisode: unknown voice group (anime_id=%d group_id=%d): %v", animeID, input.GroupID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown voice group"})
		return
	}

	ep := models.Episode{
		AnimeID:  animeID,
		GroupID:  input.GroupID,
		Number:   input.Number,
		Duration: input.Duration,
	}

	err = app.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&ep).Error; err != nil {
			return err
		}

		// Create default video source
		source := models.VideoSource{
			EpisodeID: ep.ID,
			Label:     "Server 1",
			Type:      models.VideoSourceTypeIframe,
			URL:       "", // Admin will need to edit this
			IsDefault: true,
			IsActive:  true,
		}
		if err := tx.Create(&source).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		log.Printf("AdminCreateEpisode: create failed (anime_id=%d group_id=%d number=%d): %v", animeID, input.GroupID, input.Number, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": mapEpisodeDBError(err)})
		return
	}

	_ = app.DB.Preload("VoiceGroup").Preload("VideoSources").First(&ep, ep.ID).Error
	c.JSON(http.StatusCreated, ep)
}

func AdminUpdateEpisode(c *gin.Context) {
	epID := c.Param("id")
	var input AdminUpsertEpisodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Number < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "episode_number must be >= 1"})
		return
	}

	var ep models.Episode
	if err := app.DB.First(&ep, epID).Error; err != nil {
		log.Printf("AdminUpdateEpisode: episode not found (episode_id=%s): %v", epID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Episode not found"})
		return
	}

	var anime models.Anime
	if err := app.DB.Select("id", "episodes").First(&anime, ep.AnimeID).Error; err == nil {
		if input.Number > anime.Episodes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "episode_number exceeds anime.episodes"})
			return
		}
	}

	var group models.VoiceGroup
	if err := app.DB.First(&group, input.GroupID).Error; err != nil {
		log.Printf("AdminUpdateEpisode: unknown voice group (episode_id=%s group_id=%d): %v", epID, input.GroupID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown voice group"})
		return
	}

	ep.GroupID = input.GroupID
	ep.Number = input.Number
	ep.Duration = input.Duration

	if err := app.DB.Save(&ep).Error; err != nil {
		log.Printf("AdminUpdateEpisode: save failed (episode_id=%s anime_id=%d group_id=%d number=%d): %v", epID, ep.AnimeID, input.GroupID, input.Number, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": mapEpisodeDBError(err)})
		return
	}

	_ = app.DB.Preload("VoiceGroup").Preload("VideoSources").First(&ep, ep.ID).Error
	c.JSON(http.StatusOK, ep)
}

func AdminDeleteEpisode(c *gin.Context) {
	epID := c.Param("id")
	var ep models.Episode
	if err := app.DB.First(&ep, epID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Episode not found"})
		return
	}

	if err := app.DB.Delete(&ep).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete episode"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Video Source Handlers

type AdminUpsertVideoSourceInput struct {
	Label     string                 `json:"label" binding:"required"`
	Type      models.VideoSourceType `json:"type" binding:"required"`
	URL       string                 `json:"url" binding:"required"`
	IsDefault bool                   `json:"is_default"`
	IsActive  bool                   `json:"is_active"`
	SortOrder int                    `json:"sort_order"`
}

func AdminCreateVideoSource(c *gin.Context) {
	epIDStr := c.Param("id")
	epID, err := strconv.ParseInt(epIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid episode id"})
		return
	}

	var input AdminUpsertVideoSourceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	source := models.VideoSource{
		EpisodeID: epID,
		Label:     input.Label,
		Type:      input.Type,
		URL:       input.URL,
		IsDefault: input.IsDefault,
		IsActive:  input.IsActive,
		SortOrder: input.SortOrder,
	}

	err = app.DB.Transaction(func(tx *gorm.DB) error {
		if source.IsDefault {
			if err := tx.Model(&models.VideoSource{}).Where("episode_id = ?", epID).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Create(&source).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create video source"})
		return
	}

	c.JSON(http.StatusCreated, source)
}

func AdminUpdateVideoSource(c *gin.Context) {
	sourceID := c.Param("id")
	var input AdminUpsertVideoSourceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var source models.VideoSource
	if err := app.DB.First(&source, sourceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video source not found"})
		return
	}

	source.Label = input.Label
	source.Type = input.Type
	source.URL = input.URL
	source.IsDefault = input.IsDefault
	source.IsActive = input.IsActive
	source.SortOrder = input.SortOrder

	err := app.DB.Transaction(func(tx *gorm.DB) error {
		if source.IsDefault {
			if err := tx.Model(&models.VideoSource{}).Where("episode_id = ? AND id != ?", source.EpisodeID, source.ID).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Save(&source).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update video source"})
		return
	}

	c.JSON(http.StatusOK, source)
}

func AdminDeleteVideoSource(c *gin.Context) {
	sourceID := c.Param("id")
	var source models.VideoSource
	if err := app.DB.First(&source, sourceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video source not found"})
		return
	}

	// Prevent deleting the last source
	var count int64
	app.DB.Model(&models.VideoSource{}).Where("episode_id = ?", source.EpisodeID).Count(&count)
	if count <= 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete the last video source"})
		return
	}

	if err := app.DB.Delete(&source).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete video source"})
		return
	}

	// If the deleted source was default, set another one as default
	if source.IsDefault {
		app.DB.Model(&models.VideoSource{}).Where("episode_id = ?", source.EpisodeID).Limit(1).Update("is_default", true)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func AdminSetDefaultVideoSource(c *gin.Context) {
	sourceID := c.Param("id")
	var source models.VideoSource
	if err := app.DB.First(&source, sourceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video source not found"})
		return
	}

	err := app.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.VideoSource{}).Where("episode_id = ?", source.EpisodeID).Update("is_default", false).Error; err != nil {
			return err
		}
		return tx.Model(&source).Update("is_default", true).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set default video source"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated default source"})
}

func mapEpisodeDBError(err error) string {
	if err == nil {
		return "Unknown error"
	}

	s := err.Error()
	if strings.Contains(s, "episode_number exceeds anime.episodes") {
		return "episode_number exceeds anime.episodes"
	}
	if strings.Contains(s, "episodes_number_min") {
		return "episode_number must be >= 1"
	}
	if strings.Contains(s, "idx_episode_unique") || strings.Contains(s, "duplicate key") {
		return "Episode already exists for this voice group and number"
	}

	return "Failed to save episode"
}

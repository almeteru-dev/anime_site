package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
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

	serverNumber := 0
	if v := strings.TrimSpace(c.Query("server_number")); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid server_number"})
			return
		}
		if n < 1 || n > 3 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "server_number must be 1, 2, or 3"})
			return
		}
		serverNumber = n
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

	q := app.DB.Where("anime_id = ?", animeID).Preload("VoiceGroup").Order("number asc")
	if serverNumber != 0 {
		q = q.Where("server_number = ?", serverNumber)
	}
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
	ServerNumber int    `json:"server_number" binding:"required"`
	GroupID      int64  `json:"group_id" binding:"required"`
	Number       int    `json:"number" binding:"required"`
	VideoURL     string `json:"video_url" binding:"required"`
	Duration     int    `json:"duration"`
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

	if input.ServerNumber < 1 || input.ServerNumber > 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "server_number must be 1, 2, or 3"})
		return
	}
	if strings.TrimSpace(input.VideoURL) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video_url is required"})
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
		AnimeID:      animeID,
		ServerNumber: input.ServerNumber,
		GroupID:      input.GroupID,
		Number:       input.Number,
		VideoURL:     strings.TrimSpace(input.VideoURL),
		Duration:     input.Duration,
	}

	if err := app.DB.Create(&ep).Error; err != nil {
		log.Printf(
			"AdminCreateEpisode: create failed (anime_id=%d server_number=%d group_id=%d number=%d): %v",
			animeID,
			input.ServerNumber,
			input.GroupID,
			input.Number,
			err,
		)
		c.JSON(http.StatusBadRequest, gin.H{"error": mapEpisodeDBError(err)})
		return
	}

	_ = app.DB.Preload("VoiceGroup").First(&ep, ep.ID).Error
	c.JSON(http.StatusCreated, ep)
}

func AdminUpdateEpisode(c *gin.Context) {
	epID := c.Param("id")
	var input AdminUpsertEpisodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.ServerNumber < 1 || input.ServerNumber > 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "server_number must be 1, 2, or 3"})
		return
	}
	if strings.TrimSpace(input.VideoURL) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video_url is required"})
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

	ep.ServerNumber = input.ServerNumber
	ep.GroupID = input.GroupID
	ep.Number = input.Number
	ep.VideoURL = strings.TrimSpace(input.VideoURL)
	ep.Duration = input.Duration

	if err := app.DB.Save(&ep).Error; err != nil {
		log.Printf(
			"AdminUpdateEpisode: save failed (episode_id=%s anime_id=%d server_number=%d group_id=%d number=%d): %v",
			epID,
			ep.AnimeID,
			input.ServerNumber,
			input.GroupID,
			input.Number,
			err,
		)
		c.JSON(http.StatusBadRequest, gin.H{"error": mapEpisodeDBError(err)})
		return
	}

	_ = app.DB.Preload("VoiceGroup").First(&ep, ep.ID).Error
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

func mapEpisodeDBError(err error) string {
	if err == nil {
		return "Unknown error"
	}

	s := err.Error()
	if strings.Contains(s, "episode_number exceeds anime.episodes") {
		return "episode_number exceeds anime.episodes"
	}
	if strings.Contains(s, "episodes_server_number_range") {
		return "server_number must be 1, 2, or 3"
	}
	if strings.Contains(s, "episodes_number_min") {
		return "episode_number must be >= 1"
	}
	if strings.Contains(s, "idx_episode_unique") || strings.Contains(s, "duplicate key") {
		return "Episode already exists for this server and voice group"
	}

	return "Failed to save episode"
}

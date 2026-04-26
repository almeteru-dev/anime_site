package handlers

import (
	"net/http"
	"strconv"
	"sort"

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
	identifier := c.Param("id")
	var anime models.Anime

	q := app.DB.Preload("Studio").
		Preload("Status").
		Preload("Source").
		Preload("Genres").
		Preload("Translations.Language")

	var err error

	if _, err := strconv.ParseInt(identifier, 10, 64); err == nil {
		err = q.First(&anime, identifier).Error
	} else {
		err = q.Where("url = ?", identifier).First(&anime).Error
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
		return
	}

	if _, parseErr := strconv.ParseInt(identifier, 10, 64); parseErr == nil {
		c.JSON(http.StatusOK, anime)
		return
	}

	var episodes []models.Episode
	_ = app.DB.Where("anime_id = ?", anime.ID).
		Preload("VoiceGroup").
		Order("server_number asc").
		Order("group_id asc").
		Order("number asc").
		Find(&episodes).Error

	type EpisodeItem struct {
		ID           int64  `json:"id"`
		Number       int    `json:"number"`
		VideoURL     string `json:"video_url"`
		Duration     int    `json:"duration"`
		GroupID      int64  `json:"group_id"`
		ServerNumber int    `json:"server_number"`
	}

	type VoiceGroupWithEpisodes struct {
		ID       int64          `json:"id"`
		Name     string         `json:"name"`
		Type     models.VoiceGroupType `json:"type"`
		Episodes []EpisodeItem  `json:"episodes"`
	}

	type EpisodesByServer map[string]map[string][]VoiceGroupWithEpisodes

	byServer := map[int]map[int64]*VoiceGroupWithEpisodes{}
	for _, ep := range episodes {
		if _, ok := byServer[ep.ServerNumber]; !ok {
			byServer[ep.ServerNumber] = map[int64]*VoiceGroupWithEpisodes{}
		}
		g, ok := byServer[ep.ServerNumber][ep.GroupID]
		if !ok {
			vg := VoiceGroupWithEpisodes{ID: ep.VoiceGroup.ID, Name: ep.VoiceGroup.Name, Type: ep.VoiceGroup.Type, Episodes: []EpisodeItem{}}
			byServer[ep.ServerNumber][ep.GroupID] = &vg
			g = &vg
		}
		g.Episodes = append(g.Episodes, EpisodeItem{ID: ep.ID, Number: ep.Number, VideoURL: ep.VideoURL, Duration: ep.Duration, GroupID: ep.GroupID, ServerNumber: ep.ServerNumber})
	}

	serverNums := make([]int, 0, len(byServer))
	for sn := range byServer {
		serverNums = append(serverNums, sn)
	}
	sort.Ints(serverNums)

	result := EpisodesByServer{}
	for _, sn := range serverNums {
		groups := byServer[sn]
		dub := make([]VoiceGroupWithEpisodes, 0)
		sub := make([]VoiceGroupWithEpisodes, 0)
		for _, g := range groups {
			if g.Type == models.VoiceGroupTypeDub {
				dub = append(dub, *g)
			} else {
				sub = append(sub, *g)
			}
		}
		sort.Slice(dub, func(i, j int) bool { return dub[i].Name < dub[j].Name })
		sort.Slice(sub, func(i, j int) bool { return sub[i].Name < sub[j].Name })
		key := "server_" + strconv.Itoa(sn)
		result[key] = map[string][]VoiceGroupWithEpisodes{
			"dub": dub,
			"sub": sub,
		}
	}

	c.JSON(http.StatusOK, gin.H{"anime": anime, "episodes": result})
}

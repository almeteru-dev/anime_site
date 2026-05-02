package handlers

import (
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

func splitCSVParam(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		v := strings.TrimSpace(p)
		if v == "" {
			continue
		}
		out = append(out, v)
	}
	return out
}

func GetAnimes(c *gin.Context) {
	var animes []models.Anime

	q := strings.TrimSpace(c.Query("q"))
	genres := splitCSVParam(c.Query("genres"))
	types := splitCSVParam(c.Query("types"))
	statuses := splitCSVParam(c.Query("statuses"))
	studios := splitCSVParam(c.Query("studios"))
	sources := splitCSVParam(c.Query("sources"))
	ratings := splitCSVParam(c.Query("ratings"))
	completeOnlyRaw := strings.TrimSpace(c.Query("complete_only"))
	completeOnly := completeOnlyRaw == "1" || strings.EqualFold(completeOnlyRaw, "true")
	sortBy := strings.TrimSpace(c.Query("sort_by"))
	sortDirRaw := strings.TrimSpace(c.Query("sort_dir"))
	sortDir := "desc"
	if strings.EqualFold(sortDirRaw, "asc") {
		sortDir = "asc"
	}
	if sortBy == "" {
		sortBy = "score"
	}
	yearFromRaw := strings.TrimSpace(c.Query("year_from"))
	yearToRaw := strings.TrimSpace(c.Query("year_to"))
	minRatingRaw := strings.TrimSpace(c.Query("min_rating"))
	releaseUnknownRaw := strings.TrimSpace(c.Query("release_unknown"))
	releaseUnknown := releaseUnknownRaw == "1" || strings.EqualFold(releaseUnknownRaw, "true")

	db := app.DB.Model(&models.Anime{}).
		Preload("Studio").
		Preload("Status").
		Preload("Source").
		Preload("Genres").
		Preload("Translations.Language")

	if completeOnly {
		db = db.Where("anime.studio_id IS NOT NULL AND anime.source_id IS NOT NULL AND anime.rating IS NOT NULL AND anime.rating <> ''")
	}

	if q != "" {
		like := "%" + strings.ToLower(q) + "%"
		db = db.Joins("LEFT JOIN anime_translations at ON at.anime_id = anime.id").
			Where("LOWER(anime.name) LIKE ? OR LOWER(at.title) LIKE ?", like, like).
			Distinct("anime.*")
	}

	if len(genres) > 0 {
		sub := app.DB.Table("anime_genres ag").
			Select("ag.anime_id").
			Joins("JOIN genres g ON g.id = ag.genre_id").
			Where("g.name IN ?", genres).
			Group("ag.anime_id").
			Having("COUNT(DISTINCT g.name) = ?", len(genres))
		db = db.Where("anime.id IN (?)", sub)
	}

	if len(statuses) > 0 {
		db = db.Joins("LEFT JOIN statuses s ON s.id = anime.status_id").
			Where("s.name IN ?", statuses).
			Distinct("anime.*")
	}

	if len(studios) > 0 {
		db = db.Where("anime.studio_id IS NOT NULL")
		db = db.Joins("LEFT JOIN studios st ON st.id = anime.studio_id").
			Where("st.name IN ?", studios).
			Distinct("anime.*")
	}

	if len(sources) > 0 {
		db = db.Where("anime.source_id IS NOT NULL")
		db = db.Joins("LEFT JOIN sources so ON so.id = anime.source_id").
			Where("so.name IN ?", sources).
			Distinct("anime.*")
	}

	if len(ratings) > 0 {
		db = db.Where("anime.rating IS NOT NULL AND anime.rating <> ''")
		db = db.Where("anime.rating IN ?", ratings)
	}

	if len(types) > 0 {
		db = db.Where("anime.kind IN ?", types)
	}

	if releaseUnknown {
		db = db.Where("anime.aired_on IS NULL")
	}

	if !releaseUnknown && (yearFromRaw != "" || yearToRaw != "") {
		yearFrom := 0
		yearTo := 9999
		if yearFromRaw != "" {
			if v, err := strconv.Atoi(yearFromRaw); err == nil {
				yearFrom = v
			}
		}
		if yearToRaw != "" {
			if v, err := strconv.Atoi(yearToRaw); err == nil {
				yearTo = v
			}
		}
		if yearFrom > yearTo {
			yearFrom, yearTo = yearTo, yearFrom
		}

		db = db.Where(
			"(anime.aired_on IS NOT NULL AND EXTRACT(YEAR FROM anime.aired_on) BETWEEN ? AND ?)",
			yearFrom,
			yearTo,
		)
	}

	if minRatingRaw != "" {
		if v, err := strconv.ParseFloat(minRatingRaw, 64); err == nil {
			db = db.Where("anime.score >= ?", v)
		}
	}

	switch sortBy {
	case "studio":
		db = db.Where("anime.studio_id IS NOT NULL")
		db = db.Joins("JOIN studios st_sort ON st_sort.id = anime.studio_id")
		db = db.Order("st_sort.name " + sortDir).Order("anime.score desc")
	case "source":
		db = db.Where("anime.source_id IS NOT NULL")
		db = db.Joins("JOIN sources so_sort ON so_sort.id = anime.source_id")
		db = db.Order("so_sort.name " + sortDir).Order("anime.score desc")
	case "rating":
		db = db.Where("anime.rating IS NOT NULL AND anime.rating <> ''")
		db = db.Order("anime.rating " + sortDir).Order("anime.score desc")
	case "score":
		fallthrough
	default:
		db = db.Order("anime.score " + sortDir)
	}

	err := db.Find(&animes).Error

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
		Preload("VideoSources").
		Preload("VideoSources.VideoLabel").
		Order("group_id asc").
		Order("number asc").
		Find(&episodes).Error

	type VideoLabelItem struct {
		ID               int64  `json:"id"`
		Name             string `json:"name"`
		IsExternalPlayer bool   `json:"is_external_player"`
	}

	type VideoSourceItem struct {
		ID         int64                  `json:"id"`
		LabelID    *int64                 `json:"label_id"`
		Label      string                 `json:"label"`
		Type       models.VideoSourceType `json:"type"`
		URL        string                 `json:"url"`
		IsDefault  bool                   `json:"is_default"`
		IsActive   bool                   `json:"is_active"`
		SortOrder  int64                  `json:"sort_order"`
		VideoLabel *VideoLabelItem        `json:"video_label,omitempty"`
	}

	type EpisodeItem struct {
		ID           int64             `json:"id"`
		Number       int               `json:"number"`
		Duration     int               `json:"duration"`
		GroupID      int64             `json:"group_id"`
		VideoSources []VideoSourceItem `json:"video_sources"`
	}

	type VoiceGroupWithEpisodes struct {
		ID       int64                 `json:"id"`
		Name     string                `json:"name"`
		Type     models.VoiceGroupType `json:"type"`
		Episodes []EpisodeItem         `json:"episodes"`
	}

	byGroup := map[int64]*VoiceGroupWithEpisodes{}
	for _, ep := range episodes {
		g, ok := byGroup[ep.GroupID]
		if !ok {
			vg := VoiceGroupWithEpisodes{
				ID:       ep.VoiceGroup.ID,
				Name:     ep.VoiceGroup.Name,
				Type:     ep.VoiceGroup.Type,
				Episodes: []EpisodeItem{},
			}
			byGroup[ep.GroupID] = &vg
			g = &vg
		}

		sources := make([]VideoSourceItem, 0)
		for _, s := range ep.VideoSources {
			var vl *VideoLabelItem
			if s.VideoLabel != nil && s.LabelID != nil {
				vl = &VideoLabelItem{ID: s.VideoLabel.ID, Name: s.VideoLabel.Name, IsExternalPlayer: s.VideoLabel.IsExternalPlayer}
			}
			sources = append(sources, VideoSourceItem{
				ID:         s.ID,
				LabelID:    s.LabelID,
				Label:      s.Label,
				Type:       s.Type,
				URL:        s.URL,
				IsDefault:  s.IsDefault,
				IsActive:   s.IsActive,
				SortOrder:  int64(s.SortOrder),
				VideoLabel: vl,
			})
		}
		// Sort sources by sort_order
		sort.Slice(sources, func(i, j int) bool {
			return sources[i].SortOrder < sources[j].SortOrder
		})

		g.Episodes = append(g.Episodes, EpisodeItem{
			ID:           ep.ID,
			Number:       ep.Number,
			Duration:     ep.Duration,
			GroupID:      ep.GroupID,
			VideoSources: sources,
		})
	}

	dub := make([]VoiceGroupWithEpisodes, 0)
	sub := make([]VoiceGroupWithEpisodes, 0)
	for _, g := range byGroup {
		if g.Type == models.VoiceGroupTypeDub {
			dub = append(dub, *g)
		} else {
			sub = append(sub, *g)
		}
	}
	sort.Slice(dub, func(i, j int) bool { return dub[i].Name < dub[j].Name })
	sort.Slice(sub, func(i, j int) bool { return sub[i].Name < sub[j].Name })

	result := map[string]interface{}{
		"dub": dub,
		"sub": sub,
	}

	c.JSON(http.StatusOK, gin.H{
		"anime":    anime,
		"episodes": map[string]interface{}{"default": result},
	})
}

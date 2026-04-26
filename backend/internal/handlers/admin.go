package handlers

import (
    "net/http"
    "regexp"
    "strings"
	"time"

    "github.com/gin-gonic/gin"
    "github.com/seva/animevista/internal/app"
    "github.com/seva/animevista/internal/models"
)

var slugNonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(input string) string {
    s := strings.ToLower(input)
    s = slugNonAlnum.ReplaceAllString(s, "-")
    s = strings.Trim(s, "-")
    return s
}

func parseOptionalDate(value string) (*time.Time, error) {
	v := strings.TrimSpace(value)
	if v == "" {
		return nil, nil
	}
	if t, err := time.Parse("2006-01-02", v); err == nil {
		return &t, nil
	}
	if t, err := time.Parse(time.RFC3339, v); err == nil {
		return &t, nil
	} else {
		return nil, err
	}
}

type AdminMetaResponse struct {
	Genres  []models.Genre  `json:"genres"`
	Studios []models.Studio `json:"studios"`
	Statuses []models.Status `json:"statuses"`
	Sources []models.Source `json:"sources"`
	Kinds   []models.KindOption `json:"kinds"`
	Ratings []models.RatingOption `json:"ratings"`
}

func AdminGetMeta(c *gin.Context) {
	var genres []models.Genre
	var studios []models.Studio
	var statuses []models.Status
	var sources []models.Source
	var kinds []models.KindOption
	var ratings []models.RatingOption

	if err := app.DB.Find(&genres).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch genres"})
		return
	}
	if err := app.DB.Find(&studios).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch studios"})
		return
	}
	if err := app.DB.Find(&statuses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statuses"})
		return
	}
	if err := app.DB.Find(&sources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sources"})
		return
	}
	if err := app.DB.Order("name asc").Find(&kinds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kinds"})
		return
	}
	if err := app.DB.Order("name asc").Find(&ratings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ratings"})
		return
	}

	c.JSON(http.StatusOK, AdminMetaResponse{
		Genres:  genres,
		Studios: studios,
		Statuses: statuses,
		Sources: sources,
		Kinds: kinds,
		Ratings: ratings,
	})
}

type AdminCreateAnimeInput struct {
    URL              string  `json:"url"`
	Kind             string  `json:"kind"`
	Duration         int     `json:"duration"`
	Rating           string  `json:"rating"`
	EpisodesAired    int     `json:"episodes_aired"`
	AiredOn          string  `json:"aired_on"`
	ReleasedOn       string  `json:"released_on"`
	TrailerURL       string  `json:"trailer_url"`
	Score            float64 `json:"score"`
	Episodes         int     `json:"episodes"`
	PosterURL        string  `json:"poster_url"`
	StudioID         *int    `json:"studio_id"`
	StatusID         *int    `json:"status_id"`
	SourceID         *int    `json:"source_id"`
	GenreIDs         []int   `json:"genre_ids"`
	TitleRU          string  `json:"title_ru" binding:"required"`
	TitleENRomaji    string  `json:"title_en_romaji" binding:"required"`
	DescriptionRU    string  `json:"description_ru"`
	DescriptionEN    string  `json:"description_en"`
}

func AdminCreateAnime(c *gin.Context) {
	var input AdminCreateAnimeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var ru, en models.Language
	if err := app.DB.Where("code = ?", "ru").First(&ru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing RU language"})
		return
	}
	if err := app.DB.Where("code = ?", "en").First(&en).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing EN language"})
		return
	}

    slug := slugify(input.TitleENRomaji)
    if slug == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid title for slug generation"})
        return
    }

    var exists int64
    _ = app.DB.Model(&models.Anime{}).Where("url = ?", slug).Count(&exists)
    if exists > 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Slug already exists"})
        return
    }

	airedOn, err := parseOptionalDate(input.AiredOn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid aired_on"})
		return
	}
	releasedOn, err := parseOptionalDate(input.ReleasedOn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid released_on"})
		return
	}

    anime := models.Anime{
        Name:     input.TitleENRomaji,
        URL:      slug,
		Kind:     input.Kind,
		Duration: input.Duration,
		Rating:   input.Rating,
		EpisodesAired: input.EpisodesAired,
		AiredOn: airedOn,
		ReleasedOn: releasedOn,
		TrailerURL: input.TrailerURL,
		Score:    input.Score,
		Episodes: input.Episodes,
		StudioID: input.StudioID,
		StatusID: input.StatusID,
		SourceID: input.SourceID,
		ImageURL: input.PosterURL,
	}
	if strings.TrimSpace(anime.Kind) != "" {
		var k models.KindOption
		if err := app.DB.Where("name = ?", strings.TrimSpace(anime.Kind)).First(&k).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown kind (add it in Kinds & Ratings)"})
			return
		}
	}
	if strings.TrimSpace(anime.Rating) != "" {
		var r models.RatingOption
		if err := app.DB.Where("name = ?", strings.TrimSpace(anime.Rating)).First(&r).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown rating (add it in Kinds & Ratings)"})
			return
		}
	}
	if anime.TrailerURL == "" {
		anime.TrailerURL = "https://www.youtube.com/watch?v=I1Pk4UUJQg4"
	}
	if input.Episodes > 0 && input.EpisodesAired > input.Episodes {
		c.JSON(http.StatusBadRequest, gin.H{"error": "episodes_aired cannot exceed episodes"})
		return
	}

	if err := app.DB.Create(&anime).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create anime"})
		return
	}

	if len(input.GenreIDs) > 0 {
		var genres []models.Genre
		if err := app.DB.Where("id IN ?", input.GenreIDs).Find(&genres).Error; err == nil {
			_ = app.DB.Model(&anime).Association("Genres").Replace(genres)
		}
	}

	_ = app.DB.Create(&models.AnimeTranslation{
		AnimeID:     anime.ID,
		LanguageID:  ru.ID,
		Title:       input.TitleRU,
		Description: input.DescriptionRU,
	}).Error
	_ = app.DB.Create(&models.AnimeTranslation{
		AnimeID:     anime.ID,
		LanguageID:  en.ID,
		Title:       input.TitleENRomaji,
		Description: input.DescriptionEN,
	}).Error

	var created models.Anime
	_ = app.DB.Preload("Studio").Preload("Status").Preload("Source").Preload("Genres").Preload("Translations.Language").First(&created, anime.ID).Error

	c.JSON(http.StatusCreated, created)
}

type AdminUpdateAnimeInput struct {
    Kind             string  `json:"kind"`
    Duration         int     `json:"duration"`
    Rating           string  `json:"rating"`
	EpisodesAired    int     `json:"episodes_aired"`
	AiredOn          string  `json:"aired_on"`
	ReleasedOn       string  `json:"released_on"`
	TrailerURL       string  `json:"trailer_url"`
    Score            float64 `json:"score"`
    Episodes         int     `json:"episodes"`
    PosterURL        string  `json:"poster_url"`
    StudioID         *int    `json:"studio_id"`
    StatusID         *int    `json:"status_id"`
    SourceID         *int    `json:"source_id"`
    GenreIDs         []int   `json:"genre_ids"`
    TitleRU          string  `json:"title_ru" binding:"required"`
    TitleENRomaji    string  `json:"title_en_romaji" binding:"required"`
    DescriptionRU    string  `json:"description_ru"`
    DescriptionEN    string  `json:"description_en"`
}

func AdminUpdateAnime(c *gin.Context) {
    id := c.Param("id")

    var input AdminUpdateAnimeInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var anime models.Anime
    if err := app.DB.First(&anime, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
        return
    }

    var ru, en models.Language
    if err := app.DB.Where("code = ?", "ru").First(&ru).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing RU language"})
        return
    }
    if err := app.DB.Where("code = ?", "en").First(&en).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing EN language"})
        return
    }

    slug := slugify(input.TitleENRomaji)
    if slug == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid title for slug generation"})
        return
    }

    var exists int64
    _ = app.DB.Model(&models.Anime{}).Where("url = ? AND id <> ?", slug, anime.ID).Count(&exists)
    if exists > 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Slug already exists"})
        return
    }

	airedOn, err := parseOptionalDate(input.AiredOn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid aired_on"})
		return
	}
	releasedOn, err := parseOptionalDate(input.ReleasedOn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid released_on"})
		return
	}

    anime.Name = input.TitleENRomaji
    anime.URL = slug
    anime.Kind = input.Kind
    anime.Duration = input.Duration
    anime.Rating = input.Rating
	if strings.TrimSpace(anime.Kind) != "" {
		var k models.KindOption
		if err := app.DB.Where("name = ?", strings.TrimSpace(anime.Kind)).First(&k).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown kind (add it in Kinds & Ratings)"})
			return
		}
	}
	if strings.TrimSpace(anime.Rating) != "" {
		var r models.RatingOption
		if err := app.DB.Where("name = ?", strings.TrimSpace(anime.Rating)).First(&r).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown rating (add it in Kinds & Ratings)"})
			return
		}
	}
	anime.EpisodesAired = input.EpisodesAired
	anime.AiredOn = airedOn
	anime.ReleasedOn = releasedOn
	anime.TrailerURL = input.TrailerURL
	if anime.TrailerURL == "" {
		anime.TrailerURL = "https://www.youtube.com/watch?v=I1Pk4UUJQg4"
	}
	if input.Episodes > 0 && input.EpisodesAired > input.Episodes {
		c.JSON(http.StatusBadRequest, gin.H{"error": "episodes_aired cannot exceed episodes"})
		return
	}
    anime.Score = input.Score
    anime.Episodes = input.Episodes
    anime.StudioID = input.StudioID
    anime.StatusID = input.StatusID
    anime.SourceID = input.SourceID
    anime.ImageURL = input.PosterURL

    tx := app.DB.Begin()
    if err := tx.Save(&anime).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update anime"})
        return
    }

    if len(input.GenreIDs) > 0 {
        var genres []models.Genre
        if err := tx.Where("id IN ?", input.GenreIDs).Find(&genres).Error; err == nil {
            _ = tx.Model(&anime).Association("Genres").Replace(genres)
        }
    } else {
        _ = tx.Model(&anime).Association("Genres").Clear()
    }

    var tRU models.AnimeTranslation
    _ = tx.Where("anime_id = ? AND language_id = ?", anime.ID, ru.ID).
        FirstOrCreate(&tRU, models.AnimeTranslation{AnimeID: anime.ID, LanguageID: ru.ID})
    tRU.Title = input.TitleRU
    tRU.Description = input.DescriptionRU
    _ = tx.Save(&tRU).Error

    var tEN models.AnimeTranslation
    _ = tx.Where("anime_id = ? AND language_id = ?", anime.ID, en.ID).
        FirstOrCreate(&tEN, models.AnimeTranslation{AnimeID: anime.ID, LanguageID: en.ID})
    tEN.Title = input.TitleENRomaji
    tEN.Description = input.DescriptionEN
    _ = tx.Save(&tEN).Error

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update anime"})
        return
    }

    var updated models.Anime
    _ = app.DB.Preload("Studio").Preload("Status").Preload("Source").Preload("Genres").Preload("Translations.Language").First(&updated, anime.ID).Error
    c.JSON(http.StatusOK, updated)
}

func AdminDeleteAnime(c *gin.Context) {
	id := c.Param("id")

	var anime models.Anime
	if err := app.DB.First(&anime, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
		return
	}

    tx := app.DB.Begin()
    _ = tx.Where("anime_id = ?", anime.ID).Delete(&models.AnimeTranslation{}).Error
    _ = tx.Where("anime_id = ?", anime.ID).Delete(&models.UserCollection{}).Error
    _ = tx.Model(&anime).Association("Genres").Clear()
    if err := tx.Delete(&anime).Error; err != nil {
        tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete anime"})
		return
	}

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete anime"})
        return
    }

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

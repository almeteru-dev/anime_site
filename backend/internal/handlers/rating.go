package handlers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/ent/anime"
	"github.com/seva/animevista/ent/userrating"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
)

type RateAnimeInput struct {
	AnimeID int64   `json:"anime_id" binding:"required"`
	Rating  float64 `json:"rating" binding:"required"`
}

func RateAnime(c *gin.Context) {
	uidAny, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid, ok := uidAny.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input RateAnimeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Rating < 0 || input.Rating > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 0 and 9"})
		return
	}
	if math.Trunc(input.Rating) != input.Rating {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be an integer between 0 and 9"})
		return
	}
	if input.Rating > 9 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 0 and 9"})
		return
	}

	var watchedCount int64
	err := app.DB.Model(&models.UserCollection{}).
		Joins("JOIN collection_types ct ON ct.id = user_collections.collection_type_id").
		Where("user_collections.user_id = ? AND user_collections.anime_id = ? AND ct.name = ?", int64(uid), input.AnimeID, "completed").
		Count(&watchedCount).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate watch status"})
		return
	}
	if watchedCount == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only rate anime in your Watched list"})
		return
	}

	ctx := c.Request.Context()
	err = app.Ent.UserRating.
		Create().
		SetUserID(int64(uid)).
		SetAnimeID(input.AnimeID).
		SetRating(input.Rating).
		OnConflictColumns(userrating.FieldUserID, userrating.FieldAnimeID).
		UpdateNewValues().
		SetRating(input.Rating).
		Exec(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OK"})
}

func GetAnimeAverageRating(c *gin.Context) {
	id64, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id64 <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid anime id"})
		return
	}

	ctx := c.Request.Context()
	a, err := app.Ent.Anime.Query().Where(anime.IDEQ(id64)).Only(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"anime_id": id64, "average_rating": a.AverageRating})
}

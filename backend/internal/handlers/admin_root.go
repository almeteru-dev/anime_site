package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminTransferRootInput struct {
	TargetUserID int64  `json:"target_user_id" binding:"required"`
	Password     string `json:"password" binding:"required"`
}

func AdminTransferRoot(c *gin.Context) {
	roleAny, _ := c.Get("role")
	role, _ := roleAny.(string)
	if role != "root" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Root access required"})
		return
	}

	requesterAny, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	requesterID := requesterAny.(int64)

	var input AdminTransferRootInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.TargetUserID == requesterID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot transfer root to self"})
		return
	}

	password := strings.TrimSpace(input.Password)
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required"})
		return
	}

	var requester models.User
	if err := app.DB.Select("id", "password_hash").First(&requester, requesterID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(requester.PasswordHash), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	var target models.User
	if err := app.DB.Select("id", "role").First(&target, input.TargetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not found"})
		return
	}
	if target.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target must be an admin"})
		return
	}

	err := app.DB.Transaction(func(tx *gorm.DB) error {
		res := tx.Exec(`
			WITH req AS (
				SELECT id FROM users WHERE id = ? AND role = 'root' FOR UPDATE
			), tgt AS (
				SELECT id FROM users WHERE id = ? AND role = 'admin' FOR UPDATE
			)
			UPDATE users
			SET
				role = CASE
					WHEN id = ? THEN 'admin'
					WHEN id = ? THEN 'root'
					ELSE role
				END,
				token_version = CASE
					WHEN id = ? THEN token_version + 1
					ELSE token_version
				END
			WHERE id IN (?, ?)
			  AND EXISTS (SELECT 1 FROM req)
			  AND EXISTS (SELECT 1 FROM tgt)
		`, requesterID, target.ID, requesterID, target.ID, requesterID, requesterID, target.ID)
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected != 2 {
			return gorm.ErrRecordNotFound
		}
		return nil
	})
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Root transfer failed (roles changed concurrently)"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to transfer root"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Root transferred", "force_logout": true})
}

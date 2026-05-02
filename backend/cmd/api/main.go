package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/seva/animevista/internal/app"
	"github.com/seva/animevista/internal/handlers"
	"github.com/seva/animevista/internal/middleware"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize Database
	app.InitDB()

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})

		// Auth routes
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.GET("/verify-email", handlers.VerifyEmail)
		api.POST("/resend-verification", handlers.ResendVerification)
		api.POST("/forgot-password", handlers.ForgotPassword)
		api.POST("/reset-password", handlers.ResetPassword)

		api.GET("/catalog/meta", handlers.GetPublicCatalogMeta)
		api.GET("/animes", handlers.GetAnimes)
		api.GET("/animes/:id", handlers.GetAnimeByID)
		api.GET("/animes/:id/episodes", handlers.GetAnimeEpisodes)

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", handlers.GetMe)
			protected.PUT("/me/age", handlers.UpdateAge)
			protected.PUT("/me/password", handlers.UpdatePassword)
			protected.POST("/me/email/request-old", handlers.RequestOldEmailCode)
			protected.POST("/me/email/verify-old", handlers.VerifyOldEmailCode)
			protected.POST("/me/email/request-new", handlers.RequestNewEmailCode)
			protected.POST("/me/email/verify-new", handlers.VerifyNewEmailCode)
			protected.GET("/collections", handlers.GetMyCollections)
			protected.POST("/collections", handlers.AddToMyCollection)
			protected.DELETE("/collections/:animeId", handlers.RemoveFromMyCollection)

			protected.GET("/users/:userId/collection", handlers.GetUserCollection)
			protected.POST("/collection", handlers.UpdateCollectionEntry)
			protected.DELETE("/users/:userId/collection/:animeId", handlers.RemoveFromCollection)

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireMinRole("moderator"))
			admin.Use(middleware.DenyModeratorDelete())
			{
				// Content management (moderator/admin/root)
				admin.GET("/meta", handlers.AdminGetMeta)
				admin.GET("/voice-groups", handlers.AdminListVoiceGroups)
				admin.POST("/animes", handlers.AdminCreateAnime)
				admin.PUT("/animes/:id", handlers.AdminUpdateAnime)
				admin.PUT("/animes/:id/genres", handlers.AdminSetAnimeGenres)
				admin.DELETE("/animes/:id", handlers.AdminDeleteAnime)
				admin.POST("/animes/:id/episodes", handlers.AdminCreateEpisode)
				admin.PUT("/episodes/:id", handlers.AdminUpdateEpisode)
				admin.DELETE("/episodes/:id", handlers.AdminDeleteEpisode)
				admin.POST("/episodes/:id/sources", handlers.AdminCreateVideoSource)
				admin.PUT("/video-sources/:id", handlers.AdminUpdateVideoSource)
				admin.DELETE("/video-sources/:id", handlers.AdminDeleteVideoSource)
				admin.PUT("/video-sources/:id/default", handlers.AdminSetDefaultVideoSource)

				// Admin/root-only: dictionaries, users, settings
				adminAdmin := admin.Group("")
				adminAdmin.Use(middleware.AdminOnly())
				{
					// meta is available for moderators via GET /admin/meta
					adminAdmin.GET("/genres", handlers.AdminListGenres)
					adminAdmin.POST("/genres", handlers.AdminCreateGenre)
					adminAdmin.PUT("/genres/:id", handlers.AdminUpdateGenre)
					adminAdmin.DELETE("/genres/:id", handlers.AdminDeleteGenre)
					adminAdmin.GET("/statuses", handlers.AdminListStatuses)
					adminAdmin.POST("/statuses", handlers.AdminCreateStatus)
					adminAdmin.PUT("/statuses/:id", handlers.AdminUpdateStatus)
					adminAdmin.DELETE("/statuses/:id", handlers.AdminDeleteStatus)
					adminAdmin.GET("/studios", handlers.AdminListStudios)
					adminAdmin.POST("/studios", handlers.AdminCreateStudio)
					adminAdmin.PUT("/studios/:id", handlers.AdminUpdateStudio)
					adminAdmin.DELETE("/studios/:id", handlers.AdminDeleteStudio)
					adminAdmin.GET("/sources", handlers.AdminListSources)
					adminAdmin.POST("/sources", handlers.AdminCreateSource)
					adminAdmin.PUT("/sources/:id", handlers.AdminUpdateSource)
					adminAdmin.DELETE("/sources/:id", handlers.AdminDeleteSource)
					adminAdmin.GET("/kinds", handlers.AdminListKinds)
					adminAdmin.POST("/kinds", handlers.AdminCreateKind)
					adminAdmin.PUT("/kinds/:id", handlers.AdminUpdateKind)
					adminAdmin.DELETE("/kinds/:id", handlers.AdminDeleteKind)
					adminAdmin.GET("/ratings", handlers.AdminListRatings)
					adminAdmin.POST("/ratings", handlers.AdminCreateRating)
					adminAdmin.PUT("/ratings/:id", handlers.AdminUpdateRating)
					adminAdmin.DELETE("/ratings/:id", handlers.AdminDeleteRating)
					// voice-groups list is available for moderators via GET /admin/voice-groups
					adminAdmin.POST("/voice-groups", handlers.AdminCreateVoiceGroup)
					adminAdmin.PUT("/voice-groups/:id", handlers.AdminUpdateVoiceGroup)
					adminAdmin.DELETE("/voice-groups/:id", handlers.AdminDeleteVoiceGroup)

					adminAdmin.GET("/users", handlers.AdminListUsers)
					adminAdmin.GET("/users/:id", handlers.AdminGetUser)
					adminAdmin.POST("/users", handlers.AdminCreateUser)
					adminAdmin.PUT("/users/:id", handlers.AdminUpdateUser)
					adminAdmin.PUT("/users/:id/ban", handlers.AdminBanUser)
					adminAdmin.PUT("/users/:id/unban", handlers.AdminUnbanUser)
					adminAdmin.POST("/users/:id/reset-password-default", handlers.AdminResetUserPasswordDefault)
					adminAdmin.DELETE("/users/:id", handlers.AdminDeleteUser)

					adminAdmin.PUT("/settings/default-password", middleware.RootOnly(), handlers.AdminSetDefaultPassword)
					adminAdmin.POST("/root/transfer", handlers.AdminTransferRoot)
				}
			}
		}
	}

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

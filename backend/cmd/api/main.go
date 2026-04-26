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

		api.GET("/animes", handlers.GetAnimes)
		api.GET("/animes/:id", handlers.GetAnimeByID)
		api.GET("/animes/:id/episodes", handlers.GetAnimeEpisodes)

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/collections", handlers.GetMyCollections)
			protected.POST("/collections", handlers.AddToMyCollection)
			protected.DELETE("/collections/:animeId", handlers.RemoveFromMyCollection)

			protected.GET("/users/:userId/collection", handlers.GetUserCollection)
			protected.POST("/collection", handlers.UpdateCollectionEntry)
			protected.DELETE("/users/:userId/collection/:animeId", handlers.RemoveFromCollection)

			// Admin only routes
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminOnly())
			{
				admin.GET("/meta", handlers.AdminGetMeta)
				admin.GET("/voice-groups", handlers.AdminListVoiceGroups)
				admin.POST("/voice-groups", handlers.AdminCreateVoiceGroup)
				admin.PUT("/voice-groups/:id", handlers.AdminUpdateVoiceGroup)
				admin.DELETE("/voice-groups/:id", handlers.AdminDeleteVoiceGroup)
				admin.POST("/animes", handlers.AdminCreateAnime)
				admin.PUT("/animes/:id", handlers.AdminUpdateAnime)
				admin.DELETE("/animes/:id", handlers.AdminDeleteAnime)
				admin.POST("/animes/:id/episodes", handlers.AdminCreateEpisode)
				admin.PUT("/episodes/:id", handlers.AdminUpdateEpisode)
				admin.DELETE("/episodes/:id", handlers.AdminDeleteEpisode)
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

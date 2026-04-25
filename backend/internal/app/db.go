package app

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"github.com/seva/animevista/internal/models"
)

var DB *gorm.DB

func InitDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")

	// Auto-Migration
	err = DB.AutoMigrate(
		&models.Language{},
		&models.Status{},
		&models.Source{},
		&models.CollectionType{},
		&models.Genre{},
		&models.Studio{},
		&models.User{},
		&models.Anime{},
		&models.AnimeTranslation{},
		&models.StatusTranslation{},
		&models.SourceTranslation{},
		&models.StudioTranslation{},
		&models.GenreTranslation{},
		&models.CollectionTypeTranslation{},
		&models.UserCollection{},
	)
	if err != nil {
		log.Fatalf("Failed to run auto-migration: %v", err)
	}

	log.Println("Database migration completed")

	// Run Seeder
	Seed(DB)
}

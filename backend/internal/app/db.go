package app

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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

	reset := os.Getenv("DB_RESET") == "true"
	if reset {
		if err := dropAllTables(DB); err != nil {
			log.Fatalf("Failed to reset database: %v", err)
		}
	}

	if err := runSQLMigrations(DB, "migrations"); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Database migrations applied")

	// Run Seeder
	Seed(DB)
}

func dropAllTables(db *gorm.DB) error {
	if db == nil {
		return nil
	}
	return db.Exec(`
DROP TABLE IF EXISTS user_collections CASCADE;
DROP TABLE IF EXISTS anime_genres CASCADE;
DROP TABLE IF EXISTS video_sources CASCADE;
DROP TABLE IF EXISTS video_labels CASCADE;
DROP TABLE IF EXISTS collection_type_translations CASCADE;
DROP TABLE IF EXISTS genre_translations CASCADE;
DROP TABLE IF EXISTS studio_translations CASCADE;
DROP TABLE IF EXISTS source_translations CASCADE;
DROP TABLE IF EXISTS status_translations CASCADE;
DROP TABLE IF EXISTS anime_translations CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS voice_groups CASCADE;
DROP TABLE IF EXISTS rating_options CASCADE;
DROP TABLE IF EXISTS kind_options CASCADE;
DROP TABLE IF EXISTS anime CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS studios CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS collection_types CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
`).Error
}

func runSQLMigrations(db *gorm.DB, migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}

	files := make([]string, 0)
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if strings.HasSuffix(name, ".sql") {
			files = append(files, name)
		}
	}
	sort.Strings(files)

	for _, name := range files {
		path := filepath.Join(migrationsDir, name)
		b, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}
		sql := strings.TrimSpace(string(b))
		if sql == "" {
			continue
		}
		if err := db.Exec(sql).Error; err != nil {
			return fmt.Errorf("exec migration %s: %w", name, err)
		}
	}
	return nil
}

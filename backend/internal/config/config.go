package config

import (
	"os"
	"strconv"
)

type Config struct {
	FRONTEND_URL  string
	BACKEND_URL   string
	IS_PRODUCTION bool
	PORT           string
	JWT_SECRET     string
	RESEND_API_KEY string
	DB_HOST        string
	DB_PORT        string
	DB_USER        string
	DB_PASSWORD    string
	DB_NAME        string
	DB_RESET       bool
}

var AppConfig Config

func LoadConfig() {
	AppConfig = Config{
		FRONTEND_URL:   getEnv("FRONTEND_URL", "http://localhost:3000"),
		BACKEND_URL:    getEnv("BACKEND_URL", "http://localhost:8080"),
		IS_PRODUCTION:  getEnvAsBool("IS_PRODUCTION", false),
		PORT:           getEnv("PORT", "8080"),
		JWT_SECRET:     getEnv("JWT_SECRET", "your-secret-key"),
		RESEND_API_KEY: getEnv("RESEND_API_KEY", ""),
		DB_HOST:        getEnv("DB_HOST", "localhost"),
		DB_PORT:        getEnv("DB_PORT", "5432"),
		DB_USER:        getEnv("DB_USER", "postgres"),
		DB_PASSWORD:    getEnv("DB_PASSWORD", ""),
		DB_NAME:        getEnv("DB_NAME", "animevista"),
		DB_RESET:       getEnvAsBool("DB_RESET", false),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvAsBool(key string, fallback bool) bool {
	valStr := getEnv(key, "")
	if val, err := strconv.ParseBool(valStr); err == nil {
		return val
	}
	return fallback
}

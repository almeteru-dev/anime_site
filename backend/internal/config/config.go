package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	FRONTEND_URL    string
	BACKEND_URL     string
	IS_PRODUCTION   bool
	PORT            string
	JWT_SECRET      string
	RESEND_API_KEY  string
	DB_HOST         string
	DB_PORT         string
	DB_USER         string
	DB_PASSWORD     string
	DB_NAME         string
	DB_RESET        bool
	TRUSTED_PROXIES []string
}

var AppConfig Config

func LoadConfig() {
	isProd := getEnvAsBool("IS_PRODUCTION", false)

	AppConfig = Config{
		IS_PRODUCTION:  isProd,
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

	if isProd {
		AppConfig.FRONTEND_URL = getEnv("FRONTEND_URL", "")
		AppConfig.BACKEND_URL = getEnv("BACKEND_URL", "")
		if AppConfig.FRONTEND_URL == "" {
			log.Println("CRITICAL: FRONTEND_URL is required in production environment.")
		}
	} else {
		AppConfig.FRONTEND_URL = getEnv("FRONTEND_URL", "http://localhost:3000")
		AppConfig.BACKEND_URL = getEnv("BACKEND_URL", "http://localhost:8080")
	}

	proxiesStr := getEnv("TRUSTED_PROXIES", "")
	if proxiesStr != "" {
		parts := strings.Split(proxiesStr, ",")
		var proxies []string
		for _, p := range parts {
			trimmed := strings.TrimSpace(p)
			if trimmed != "" {
				proxies = append(proxies, trimmed)
			}
		}
		AppConfig.TRUSTED_PROXIES = proxies
	} else if !isProd {
		AppConfig.TRUSTED_PROXIES = []string{"127.0.0.1"}
	} else {
		AppConfig.TRUSTED_PROXIES = nil
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

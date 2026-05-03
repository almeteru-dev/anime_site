package app

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/seva/animevista/ent"
	_ "github.com/lib/pq"
)

var Ent *ent.Client

func PostgresDSN() string {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, password, dbname, port)
}

func InitEnt() {
	dsn := strings.TrimSpace(PostgresDSN())
	client, err := ent.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to init ent client: %v", err)
	}
	Ent = client
}


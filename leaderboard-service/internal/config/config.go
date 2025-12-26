package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ .env not found, using system env")
	}
	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "Daniil"),
		DBPassword: getEnv("DB_PASSWORD", "Admin"),
		DBName:     getEnv("DB_NAME", "leaderboard_service_db_doodleJumpMotion"),
	}
}

func getEnv(key, def string) string {
	if val := os.Getenv(key); val !=""{
		return val
	}
	return def
}
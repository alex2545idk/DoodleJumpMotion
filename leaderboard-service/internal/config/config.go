package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	RedisAddr     string
	RedisPassword string
	RedisDB       int
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ .env not found, using system env")
	}

	return &Config{
		AppPort: getEnv("APP_PORT", "8080"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "Daniil"),
		DBPassword: getEnv("DB_PASSWORD", "Admin"),
		DBName:     getEnv("DB_NAME", "leaderboard_service_db_doodleJumpMotion"),

		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvAsInt("REDIS_DB", 0),
	}
}

func getEnv(key, def string) string {
	if val := os.Getenv(key); val !=""{
		return val
	}
	return def
}

func getEnvAsInt(key string, def int) int {
	if val := os.Getenv(key); val != "" {
		var v int
		_, err := fmt.Sscanf(val, "%d", &v)
		if err == nil {
			return v
		}
	}
	return def
}
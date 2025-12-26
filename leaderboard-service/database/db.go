package database

import (
	"doodlejump-backend/leaderboard-service/internal/config"
	"doodlejump-backend/leaderboard-service/internal/models"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect (cfg *config.Config) {
	dns := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dns), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	DB = db
	log.Println("✅ Connected to PostgreSQL")
	autoMigrate()
}

func autoMigrate() {
	err := DB.AutoMigrate(
		&models.LeaderboardUserModel{},
	)
	if err != nil {
		log.Fatalf("❌ AutoMigrate error: %v", err)
	}

	log.Println("✅ AutoMigrate complete")
}
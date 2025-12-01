package main

import (
	"doodlejump-backend/user-service/internal/config"
	"doodlejump-backend/user-service/internal/domain"
	"doodlejump-backend/user-service/internal/http"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	cfg := config.NewConfig()
	godotenv.Load()
	token := os.Getenv("INTERNAL_API_TOKEN")
	fmt.Println("Loaded internal token:", token)

	db, err := config.ConnectDB(cfg)
	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}

	err = db.AutoMigrate(&domain.User{})
	if err != nil {
		panic(fmt.Sprintf("failed to migrate users table: %v", err))
	}
	fmt.Println("Users table migrated successfully!")

	r := http.RegisterRoutes(db)

	if err := r.Run(":8080"); err != nil {
		panic(fmt.Sprintf("failed to run server: %v", err))
	}
}

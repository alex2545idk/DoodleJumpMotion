package main

import (
	"context"
	"doodlejump-backend/leaderboard-service/internal/config"
	"doodlejump-backend/leaderboard-service/internal/database"
	"doodlejump-backend/leaderboard-service/internal/dto"
	"doodlejump-backend/leaderboard-service/internal/handlers"
	"doodlejump-backend/leaderboard-service/internal/models"
	"doodlejump-backend/leaderboard-service/internal/redis"
	"doodlejump-backend/leaderboard-service/internal/repository"
	"doodlejump-backend/leaderboard-service/internal/services"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	cfg := config.LoadConfig()
	godotenv.Load()
	
	db, err := database.Connect(cfg)
	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}
	
	err = db.AutoMigrate(&models.LeaderboardUserModel{})
	if err != nil {
		panic(fmt.Sprintf("failed to migrate users table: %v", err))
	}
	fmt.Println("Users table migrated successfully!")

	rdb := redis.NewClient(cfg)

	pgRepo := repository.NewLeaderboardRepository()
	redisRepo := repository.NewRedisLeaderboardRepository(rdb)

	service := services.NewLeaderboardService(pgRepo, redisRepo)

	go func() {
		if err := syncUsersFromUserService(service); err != nil {
			log.Printf("❌ failed to sync users: %v", err)
		} else {
			log.Println("✅ users synced successfully")
		}
	}()

	handler := handlers.NewLeaderboardHandler(service)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000", //front
			"http://localhost:8085", //user service
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/leaderboard/top", handler.GetTopHandler)
	r.POST("/leaderboard/update", handler.UpdateAndSaveCup)
	r.Run(":" + cfg.AppPort)
}

func syncUsersFromUserService(service *services.LeaderboardService) error{
	req, err := http.NewRequest(
		http.MethodGet,
		"http://user-service:8080/info/users/all",
		nil,
	)
	if err != nil {
		return err
	}
	req.Header.Set("INTERNAL_API_TOKEN", os.Getenv("INTERNAL_API_TOKEN"))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	var users []dto.UserDTO
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return err
	}
	for _, u := range users {
		err := service.UpdatePlayerCups(
			context.Background(),
			u.ID,
			u.Cups,
		)
		if err != nil {
			log.Printf("Failed to sync user %d: %v", u.ID, err)
		}
	}
	
	return nil
}
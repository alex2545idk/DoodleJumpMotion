package main

import (
	"log"
	"session-service/config"
	"session-service/internal/database"
	"session-service/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	database.Connect(cfg)

	r := gin.Default()

	routes.RegisterRoutes(r)

	log.Println("🚀 Session Service running on port " + cfg.AppPort)
	r.Run(":" + cfg.AppPort)
}

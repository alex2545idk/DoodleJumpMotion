package main

import (
	"context"
	"doodlejump-backend/leaderboard-service/internal/redis"
	"doodlejump-backend/leaderboard-service/internal/repository"
	"log"
	"net/http"
)

func main() {
	ctx := context.Background()  // <--- обязательно

	rdb := redis.NewClient()
	repo := repository.NewRedisLeaderboardRepository(rdb)

	if err := repo.SetScore(ctx, 1, 120); err != nil {
		log.Fatalf("SetScore failed: %v", err)
	}

	rank, err := repo.GetRank(ctx, 1)
	if err != nil {
		log.Fatalf("GetRank failed: %v", err)
	}

	log.Println("Rank of user 1:", rank)

	http.ListenAndServe(":8080", nil)
}
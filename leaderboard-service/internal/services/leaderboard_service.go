package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"doodlejump-backend/leaderboard-service/internal/domain"
	"doodlejump-backend/leaderboard-service/internal/dto"
	"doodlejump-backend/leaderboard-service/internal/repository"
)

type LeaderboardService struct {
	pgRepo    *repository.LeaderboardRepository
	redisRepo *repository.RedisLeaderboardRepository
}

func NewLeaderboardService(pg *repository.LeaderboardRepository, rd *repository.RedisLeaderboardRepository) *LeaderboardService {
	return &LeaderboardService{
		pgRepo: pg,
		redisRepo: rd,
	}
}

func (s *LeaderboardService) UpdatePlayerCups(ctx context.Context, userId uint, cups uint, username string) error {
	if err := s.pgRepo.UpdateAndSaveCups(userId, cups, username); err != nil {
        return err
    }

	return s.redisRepo.SetScore(ctx, int64(userId), int64(cups))
}

func (s *LeaderboardService) GetUserRank(ctx context.Context, userId uint) (uint, error) {
	rank, err := s.redisRepo.GetRank(ctx, int64(userId)) 
	if err != nil {
		return 0, err
	}
	return uint(rank), nil
}

func (s *LeaderboardService) GetNTop(ctx context.Context, limit int64) ([]domain.LeaderboardEntry, error) {
	list, err := s.redisRepo.GetTop(ctx, limit)

	if err != nil {
		return []domain.LeaderboardEntry{}, err
	}
	return list, nil
}


func SyncUsersFromUserService(service *LeaderboardService) error{
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

	var body struct {
	Users []dto.UserDTO `json:"users"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return err
	}
	users := body.Users
	for _, u := range users {
		err := service.UpdatePlayerCups(
			context.Background(),
			u.ID,
			u.Cups,
			u.Username,
		)
		if err != nil {
			log.Printf("Failed to sync user %d: %v", u.ID, err)
		}
	}

	return nil
}
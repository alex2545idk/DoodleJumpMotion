package services

import (
	"context"

	"doodlejump-backend/leaderboard-service/internal/domain"
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

func (s *LeaderboardService) UpdatePlayerCups(ctx context.Context, userId uint, cups uint) error {
	if err := s.pgRepo.UpdateAndSaveCups(userId, cups); err != nil {
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


package repository

import (
	"context"
	"doodlejump-backend/leaderboard-service/internal/domain"
	"log"
	"strconv"

	"github.com/redis/go-redis/v9"
)

type RedisLeaderboardRepository struct {
	rdb *redis.Client
	pgRepo *LeaderboardRepository
}

func NewRedisLeaderboardRepository (rdb *redis.Client, pgRepo *LeaderboardRepository) *RedisLeaderboardRepository {
	if rdb == nil {
		log.Fatal("Redis client is nil!")
	}
	return &RedisLeaderboardRepository{rdb: rdb, pgRepo: pgRepo}
}

func (r *RedisLeaderboardRepository) SetScore(ctx context.Context, userID, cups int64) error {
	return r.rdb.ZAdd(ctx, "leaderboard:global", redis.Z{
		Score: float64(cups),
		Member: strconv.FormatInt(userID, 10),
	}).Err()
}

func (r *RedisLeaderboardRepository) GetRank(ctx context.Context, userID int64) (int64,error) {
	rank, err := r.rdb.ZRevRank(ctx, "leaderboard:global", strconv.FormatInt(userID, 10)).Result()
	if err == redis.Nil {
		return -1, nil
	}
	if err != nil {
		return -1, err
	}
	return rank + 1, nil
}

func (r *RedisLeaderboardRepository) GetTop(ctx context.Context, limit int64) ([]domain.LeaderboardEntry, error) {
	zs, err := r.rdb.ZRevRangeWithScores(ctx, "leaderboard:global", 0, limit-1).Result()
	if err == redis.Nil {
		return []domain.LeaderboardEntry{}, nil
	}
	if err != nil {
		return nil, err
	}

	entries := make([]domain.LeaderboardEntry, 0, len(zs))

	for _, z := range zs {
		userIDStr, ok := z.Member.(string)
		if !ok {
			continue
		}

		userID, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil {
			continue
		}

		// 🎯 Достаём username из PostgreSQL
		username, _ := r.pgRepo.GetUserNameById(uint(userID))

		entries = append(entries, domain.LeaderboardEntry{
			User_id:   uint(userID),
			Username:  username,
			Cup_count: uint(z.Score),
		})
	}

	return entries, nil
}

func (r *RedisLeaderboardRepository) GetCups(ctx context.Context, userID uint) (int64, error) {
	cups, err := r.rdb.ZScore(ctx, "leaderboard:global", strconv.FormatUint(uint64(userID), 10)).Result()

	if err == redis.Nil {
		return 0, nil
	}
	if err != nil {
        return 0, err
    }
	return int64(cups), nil
}
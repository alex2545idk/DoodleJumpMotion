package repository

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

type RedisLeaderboardRepository struct {
	rdb *redis.Client
}

func NewRedisLeaderboardRepository (rdb *redis.Client) *RedisLeaderboardRepository {
	if rdb == nil {
		log.Fatal("Redis client is nil!")
	}
	return &RedisLeaderboardRepository{rdb: rdb}
}

func (r *RedisLeaderboardRepository) SetScore(ctx context.Context, userID, cups int64) error {
	return r.rdb.ZAdd(ctx, "leaderboard:global", redis.Z{
		Score: float64(cups),
		Member: userID,
	}).Err()
}

func (r *RedisLeaderboardRepository) GetRank(ctx context.Context, userID int64) (int64,error) {
	rank, err := r.rdb.ZRevRank(ctx, "leaderboard:global", string(userID)).Result()
	if err == redis.Nil {
		return -1, nil
	}
	if err != nil {
		return -1, err
	}
	return rank + 1, nil
}

func (r *RedisLeaderboardRepository) GetTop(ctx context.Context, limit int64) ([]redis.Z, error) {
	return r.rdb.ZRevRangeWithScores(ctx, "leaderboard:global", 0, limit-1).Result()
}
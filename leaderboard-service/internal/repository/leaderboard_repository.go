package repository

import (
	"doodlejump-backend/leaderboard-service/database"
	"doodlejump-backend/leaderboard-service/internal/models"
)

type LeaderboardRepository struct{}

func NewLeaderboardRepository() *LeaderboardRepository {
	return &LeaderboardRepository{}
}

func (r *LeaderboardRepository) Create(leaderUser *models.LeaderboardUserModel) error {
	return database.DB.Create(leaderUser).Error
}

// func (r *LeaderboardRepository) GetAllUsers() ([]models.LeaderboardUserModel, error) {
// 	var leaderUser models.LeaderboardUserModel
// 	if err := database.DB.
// }
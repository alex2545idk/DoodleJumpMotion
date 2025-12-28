package repository

import (
	"context"
	"doodlejump-backend/leaderboard-service/internal/database"
	"doodlejump-backend/leaderboard-service/internal/domain"
	"doodlejump-backend/leaderboard-service/internal/models"
)

type LeaderboardRepository struct{}

type LeaderboardRepositoryContract interface {
	GetTop(ctx context.Context, limit int64) ([]domain.LeaderboardEntry, error)
}

func NewLeaderboardRepository() *LeaderboardRepository {
	return &LeaderboardRepository{}
}

func (r *LeaderboardRepository) Create(leaderUser *models.LeaderboardUserModel) error {
	return database.DB.Create(leaderUser).Error
}

func (r *LeaderboardRepository) UpdateAndSaveCups(userID, cups uint,) error{
	var user models.LeaderboardUserModel

	return database.DB.Where(models.LeaderboardUserModel{UserID: userID}).Assign(models.LeaderboardUserModel{CupCount: cups}).FirstOrCreate(&user).Error
}

func (r *LeaderboardRepository) Delete(userID uint) error {
	return database.DB.Where(models.LeaderboardUserModel{UserID: userID}).Delete(&models.LeaderboardUserModel{}).Error
}

func (r *LeaderboardRepository) GetByUserID(userID uint) (*models.LeaderboardUserModel, error) {
    var user models.LeaderboardUserModel
    err := database.DB.Where("user_id = ?", userID).First(&user).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// func (r *LeaderboardRepository) GetUsersByCupRange(arenaID uint) ([]models.LeaderboardUserModel, error) {
//     var users []models.LeaderboardUserModel
// 	var minCups, maxCups int
// 	switch arenaID {
// 	case 1:
// 		minCups = 0
// 		maxCups = 499
// 	case 2:
// 		minCups = 500
// 		maxCups = 999
// 	case 3:
// 		minCups = 1000
// 		maxCups = 1499
// 	case 4:
// 		minCups = 1500
// 		maxCups = 1999
// 	case 5:
// 		minCups = 2000
// 		maxCups = 2499
// 	case 6:
// 		minCups = 2500
// 		maxCups = 2999
// 	case 7:
// 		minCups = 3000
// 		maxCups = 3499
// 	case 8:
// 		minCups = 3500
// 		maxCups = 3999
// 	case 9:
// 		minCups = 4000
// 		maxCups = 4499
// 	case 10:
// 		minCups = 4500
// 		maxCups = 999999
// 	}

//     err := database.DB.Where("cup_count BETWEEN ? AND ?", minCups, maxCups).
//         Order("cup_count DESC").
//         Limit(100).
//         Find(&users).Error
//     return users, err
// }

func (r *LeaderboardRepository) GetByCupRange(min, max uint) ([]models.LeaderboardUserModel, error) {
    var users []models.LeaderboardUserModel
    err := database.DB.Where("cup_count BETWEEN ? AND ?", min, max).
        Order("cup_count DESC").
        Limit(100).
        Find(&users).Error
    return users, err
}

func (r *LeaderboardRepository) GetGlobalTop(limit int) ([]models.LeaderboardUserModel, error) {
    var users []models.LeaderboardUserModel
    err := database.DB.Order("cup_count DESC").Limit(limit).Find(&users).Error
    return users, err
}
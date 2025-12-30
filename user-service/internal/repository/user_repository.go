package repository

import (
	"doodlejump-backend/user-service/internal/domain"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

type UserShort struct {
	ID       int64  `json:"user_id"`
	Username string `json:"username"`
	CupCount int    `json:"cup_count"`
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetUserByUsername(username string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByID(id int64) (*domain.User, error) {
	var user domain.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(email string) (*domain.User, error) {
    var user domain.User
    if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
        return nil, err
    }
    return &user, nil
}


func (r *UserRepository) GetByID(id int64) (*domain.User, error) {
    var user domain.User
    if err := r.db.First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) UpdateUser(u *domain.User) error {
    return r.db.Save(u).Error
}

func (r *UserRepository) GetAllUsersInfo() ([]UserShort, error) {
	var users []UserShort
	err := r.db.Model(&domain.User{}).Select("id", "username", "cup_count").Scan(&users).Error
	return users, err
}
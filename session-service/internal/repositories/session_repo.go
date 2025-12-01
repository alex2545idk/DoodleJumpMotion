package repositories

import (
	"session-service/internal/database"
	"session-service/internal/models"
)

type SessionRepository struct{}

func NewSessionRepository() *SessionRepository {
    return &SessionRepository{}
}

func (r *SessionRepository) Create(session *models.Session) error {
    return database.DB.Create(session).Error
}

func (r *SessionRepository) GetByID(id uint) (*models.Session, error) {
    var session models.Session
    if err := database.DB.First(&session, id).Error; err != nil {
        return nil, err
    }
    return &session, nil
}

func (r *SessionRepository) Update(session *models.Session) error {
	return database.DB.Save(session).Error
}
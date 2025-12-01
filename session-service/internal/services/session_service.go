package services

import (
	"session-service/internal/models"
	"session-service/internal/repositories"
)

type SessionService struct {
    repo *repositories.SessionRepository
}

func NewSessionService(repo *repositories.SessionRepository) *SessionService {
    return &SessionService{repo: repo}
}

func (s *SessionService) CreateSession(session *models.Session) error {
    // Здесь можно добавить любую логику, например проверку статусов или лимитов
    return s.repo.Create(session)
}

func (s *SessionService) GetSession(id uint) (*models.Session, error) {
    return s.repo.GetByID(id)
}

func (s *SessionService) UpdateSession(session *models.Session) error {
	return s.repo.Update(session)
}

func СalculateCupDiff(winnerScore, loserScore int) (winnerCups int, loserCups int) {
    baseDiff := 25 

    if loserScore == 0 {
        return baseDiff, baseDiff
    }

    ratio := float64(winnerScore) / float64(loserScore)

    if ratio >= 2.0 {
        winnerCups = baseDiff + 10
        loserCups = baseDiff + 10
    } else {
        winnerCups = baseDiff + int(float64(baseDiff)*(ratio-1))
        loserCups = baseDiff
    }

    return
}
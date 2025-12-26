package models

import "time"

type LeaderboardUserModel struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"uniqueIndex;not null"`
	Username  string    `gorm:"size:100;not null"`
	CupCount  uint      `gorm:"not null"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}
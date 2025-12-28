package domain

type LeaderboardEntry struct {
	ID        int64 `json:"id"`
	User_id   uint  `json:"user_id"`
	Cup_count uint  `json:"cup_count"`
}
package domain

type LeaderboardEntry struct {
	User_id   uint   `json:"user_id"`
	Username  string `json:"username"`
	Cup_count uint   `json:"cup_count"`
}
package dto

type UserDTO struct {
	ID       uint   `json:"user_id"`
	Username string `json:"username"`
	Cups     uint   `json:"cup_count"`
}

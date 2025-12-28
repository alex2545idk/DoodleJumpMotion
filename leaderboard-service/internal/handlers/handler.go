package handlers

import (
	"doodlejump-backend/leaderboard-service/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LeaderboardHandler struct {
	service *services.LeaderboardService
}

func NewLeaderboardHandler(s *services.LeaderboardService) *LeaderboardHandler {
	return &LeaderboardHandler{service: s}
}

func (h *LeaderboardHandler) GetTopHandler(c *gin.Context) {
	limitStr := c.Query("limit")
	if limitStr == "" {
		limitStr = "10"
	}

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
		return
	}

	entries, err := h.service.GetNTop(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return 
	}

	c.JSON(http.StatusOK, entries)
}

func (h *LeaderboardHandler) UpdateAndSaveCup(c *gin.Context) {
	userIDStr := c.Query("userId")
	cupsStr := c.Query("cups")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, "error: request without userId")
	}
	if cupsStr == "" {
		c.JSON(http.StatusBadRequest, "error: request without cups")
	}

	userId, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid userId"})
		return
	}
	cups, err := strconv.ParseUint(cupsStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cups"})
		return
	}

	entries := h.service.UpdatePlayerCups(c.Request.Context(), uint(userId), uint(cups))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return 
	}

	c.JSON(http.StatusOK, entries)
}
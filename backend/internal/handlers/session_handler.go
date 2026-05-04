package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/internal/models"
)

type SessionHandler struct{ DB *gorm.DB }

func (h *SessionHandler) List(c *gin.Context) {
	var sessions []models.MealSession
	h.DB.Preload("Categories.Items").Order("created_at desc").Find(&sessions)
	c.JSON(http.StatusOK, sessions)
}

func (h *SessionHandler) ListActive(c *gin.Context) {
	var sessions []models.MealSession
	h.DB.Where("is_active = true").Preload("Categories.Items").Find(&sessions)

	// Lọc theo thời gian thực tế
	now := time.Now().Format("15:04")
	activeSessions := []models.MealSession{}

	for _, s := range sessions {
		if s.StartTime != "" && s.EndTime != "" {
			// Chỉ lấy nếu Start <= Now <= End
			if now >= s.StartTime && now <= s.EndTime {
				activeSessions = append(activeSessions, s)
			}
		} else {
			activeSessions = append(activeSessions, s)
		}
	}

	c.JSON(http.StatusOK, activeSessions)
}

func (h *SessionHandler) Create(c *gin.Context) {
	var session models.MealSession
	if err := c.ShouldBindJSON(&session); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra thời gian logic
	if session.StartTime != "" && session.EndTime != "" && session.EndTime <= session.StartTime {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giờ kết thúc phải lớn hơn giờ bắt đầu (Định dạng 24h)"})
		return
	}

	userID, _ := c.Get("user_id")
	session.CreatedBy = parseUUID(userID.(string))
	if err := h.DB.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, session)
}

func (h *SessionHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var session models.MealSession
	if err := h.DB.First(&session, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra thời gian logic nếu có cập nhật thời gian
	startTime, hasStart := updates["start_time"].(string)
	endTime, hasEnd := updates["end_time"].(string)
	if hasStart && hasEnd && startTime != "" && endTime != "" && endTime <= startTime {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giờ kết thúc phải lớn hơn giờ bắt đầu"})
		return
	}

	h.DB.Model(&session).Updates(updates)
	c.JSON(http.StatusOK, session)
}

func (h *SessionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	h.DB.Delete(&models.MealSession{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

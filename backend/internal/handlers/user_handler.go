package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/internal/models"
)

type UserHandler struct{ DB *gorm.DB }

func (h *UserHandler) List(c *gin.Context) {
	status := c.Query("status") // optional filter
	var users []models.User
	q := h.DB.Order("created_at desc")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Find(&users)
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) Approve(c *gin.Context) {
	id := c.Param("id")
	now := time.Now()
	if err := h.DB.Model(&models.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "approved",
		"is_approved": true,
		"approved_at": &now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user approved"})
}

func (h *UserHandler) Reject(c *gin.Context) {
	id := c.Param("id")
	now := time.Now()
	if err := h.DB.Model(&models.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "rejected",
		"is_approved": false,
		"rejected_at": &now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user rejected"})
}

func (h *UserHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.User{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

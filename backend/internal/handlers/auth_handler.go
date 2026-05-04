package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/internal/middleware"
	"github.com/yourusername/lunchorder/internal/models"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret string
	JWTExpire int
}

type registerRequest struct {
	FullName      string `json:"full_name" binding:"required"`
	Phone         string `json:"phone" binding:"required"`
	Password      string `json:"password" binding:"required,min=6"`
	RoleInCompany string `json:"role_in_company"`
}

type loginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		FullName:      req.FullName,
		Phone:         req.Phone,
		RoleInCompany: req.RoleInCompany,
		PasswordHash:  string(hash),
		Status:        "pending",
		Role:          "user",
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "phone number already registered"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "registered successfully, waiting for admin approval",
		"user":    user,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.DB.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid phone or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid phone or password"})
		return
	}

	expire := time.Duration(h.JWTExpire) * time.Hour
	claims := middleware.Claims{
		UserID: user.ID.String(),
		Role:   user.Role,
		Status: user.Status,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(h.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenStr,
		"user":  user,
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func parseJWTExpire(cfg string) int {
	v, err := strconv.Atoi(cfg)
	if err != nil {
		return 24
	}
	return v
}

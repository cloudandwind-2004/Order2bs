package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/yourusername/lunchorder/config"
)

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Status string `json:"status"`
	jwt.RegisteredClaims
}

// JWTAuth validates Bearer token and sets user info in context
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid authorization header"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)
		c.Set("user_status", claims.Status)
		c.Next()
	}
}

// RequireAdmin checks that the user has admin role
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("user_role")
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}
		c.Next()
	}
}

// RequireApproved checks that the user account is approved
func RequireApproved() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("user_role")
		if role == "admin" {
			c.Next()
			return
		}
		status, _ := c.Get("user_status")
		if status != "approved" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "account pending approval"})
			return
		}
		c.Next()
	}
}

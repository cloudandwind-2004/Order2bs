package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/yourusername/lunchorder/config"
	"github.com/yourusername/lunchorder/db"
	"github.com/yourusername/lunchorder/internal/handlers"
	"github.com/yourusername/lunchorder/internal/middleware"
	"github.com/yourusername/lunchorder/internal/websocket"
)

func main() {
	// Load .env
	_ = godotenv.Load()

	// Load config
	cfg := config.Load()

	// Connect DB
	database := db.Connect(cfg)
	db.AutoMigrate(database)

	// WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// Gin router
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		AllowCredentials: true,
	}))

	// Static uploads
	r.Static("/uploads", "./uploads")

	// Init handlers
	h := handlers.New(database, hub, cfg)

	// ── Health Check (for K8s probes) ────────────────────────
	r.GET("/api/health", func(c *gin.Context) {
		sqlDB, err := database.DB()
		if err != nil || sqlDB.Ping() != nil {
			c.JSON(503, gin.H{"status": "unhealthy", "error": "database unreachable"})
			return
		}
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// ── Public routes ────────────────────────────────────────
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Auth.Register)
			auth.POST("/login", h.Auth.Login)
		}

		// WebSocket
		r.GET("/ws", func(c *gin.Context) {
			websocket.ServeWS(hub, c.Writer, c.Request)
		})
	}

	// ── User routes (auth required) ──────────────────────────
	user := api.Group("/")
	user.Use(middleware.JWTAuth(cfg))
	user.Use(middleware.RequireApproved())
	{
		user.GET("/auth/me", h.Auth.Me)
		user.GET("/sessions/active", h.Session.ListActive)
		user.GET("/sessions/:id/menu", h.Menu.GetSessionMenu)
		user.POST("/orders", h.Order.Create)
		user.GET("/orders/my", h.Order.MyOrders)
		user.GET("/debts/my", h.Debt.MyDebts)
		user.POST("/payments", h.Payment.Create)
		user.GET("/bank-qr", h.Settings.GetBankQR)
		user.PATCH("/auth/qr", h.SelfCook.UpdateUserQR)
	}

	// ── Admin routes ─────────────────────────────────────────
	admin := api.Group("/admin")
	admin.Use(middleware.JWTAuth(cfg))
	admin.Use(middleware.RequireAdmin())
	{
		// Users
		admin.GET("/users", h.User.List)
		admin.PATCH("/users/:id/approve", h.User.Approve)
		admin.PATCH("/users/:id/reject", h.User.Reject)
		admin.PATCH("/users/:id", h.User.Update)
		admin.POST("/users/:id/reset-password", h.User.ResetPassword)
		admin.DELETE("/users/:id", h.User.Delete)

		// Meal Sessions
		admin.GET("/sessions", h.Session.List)
		admin.POST("/sessions", h.Session.Create)
		admin.PUT("/sessions/:id", h.Session.Update)
		admin.DELETE("/sessions/:id", h.Session.Delete)

		// Menu
		admin.POST("/sessions/:id/categories", h.Menu.CreateCategory)
		admin.PUT("/categories/:id", h.Menu.UpdateCategory)
		admin.DELETE("/categories/:id", h.Menu.DeleteCategory)
		admin.POST("/categories/:id/items", h.Menu.CreateItem)
		admin.PUT("/items/:id", h.Menu.UpdateItem)
		admin.DELETE("/items/:id", h.Menu.DeleteItem)

		// Combo Rules
		admin.POST("/sessions/:id/combo", h.Menu.SaveComboRule)
		admin.POST("/sessions/:id/menu/bulk", h.Menu.BulkImportMenu)

		// Orders
		admin.GET("/orders", h.Order.List)
		admin.PATCH("/orders/:id/status", h.Order.UpdateStatus)

		// Debts & Payments
		admin.GET("/debts", h.Debt.List)
		admin.GET("/payments", h.Payment.List)
		admin.POST("/payments/:id/confirm", h.Payment.Confirm)

		// Dashboard
		admin.GET("/dashboard/monthly", h.Dashboard.Monthly)
		admin.GET("/dashboard/weekly", h.Dashboard.Weekly)
		admin.GET("/dashboard/summary", h.Dashboard.Summary)

		// Settings
		admin.POST("/settings/bank-qr", h.Settings.UploadBankQR)
		admin.GET("/settings/bank-qr", h.Settings.GetBankQR)

		// Self-cook logs
		admin.GET("/self-cooks", h.SelfCook.ListLogs)
		admin.GET("/self-cooks/summary", h.SelfCook.GroupedSummary)
		admin.POST("/self-cooks/:userID/confirm", h.SelfCook.ConfirmPayment)
	}

	log.Printf("🚀 Server running on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}

package handlers

import (
	"strconv"

	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/config"
	"github.com/yourusername/lunchorder/internal/websocket"
)

// Handlers aggregates all handler groups
type Handlers struct {
	Auth      *AuthHandler
	User      *UserHandler
	Session   *SessionHandler
	Menu      *MenuHandler
	Order     *OrderHandler
	Debt      *DebtHandler
	Payment   *PaymentHandler
	Dashboard *DashboardHandler
	Settings  *SettingsHandler
	SelfCook  *SelfCookHandler
}

func New(db *gorm.DB, hub *websocket.Hub, cfg *config.Config) *Handlers {
	expire, _ := strconv.Atoi(cfg.JWTExpire)
	return &Handlers{
		Auth: &AuthHandler{
			DB:        db,
			JWTSecret: cfg.JWTSecret,
			JWTExpire: expire,
		},
		User:      &UserHandler{DB: db},
		Session:   &SessionHandler{DB: db},
		Menu:      &MenuHandler{DB: db},
		Order:     &OrderHandler{DB: db, Hub: hub},
		Debt:      &DebtHandler{DB: db},
		Payment:   &PaymentHandler{DB: db, Hub: hub},
		Dashboard: &DashboardHandler{DB: db},
		Settings:  &SettingsHandler{DB: db},
		SelfCook:  &SelfCookHandler{DB: db},
	}
}

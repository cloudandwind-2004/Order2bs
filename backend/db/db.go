package db

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/yourusername/lunchorder/config"
	"github.com/yourusername/lunchorder/internal/models"
)

func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Ho_Chi_Minh",
		cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, cfg.DB.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("❌ Cannot connect to database: %v", err)
	}

	log.Println("✅ Database connected")
	return db
}

// AutoMigrate creates/updates all tables
func AutoMigrate(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.User{},
		&models.AuthLoginAttempt{},
		&models.BankQrSetting{},
		&models.MealSession{},
		&models.MenuCategory{},
		&models.MenuItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.OrderStatusHistory{},
		&models.Debt{},
		&models.Payment{},
		&models.PaymentProof{},
		&models.PaymentAllocation{},
		&models.SelfCookLog{},
		&models.DashboardSummarySnapshot{},
		&models.DashboardMonthlyStat{},
	)
	if err != nil {
		log.Fatalf("❌ AutoMigrate failed: %v", err)
	}
	log.Println("✅ Database migrated")
}

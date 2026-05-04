package config

import (
	"os"
)

type Config struct {
	Port      string
	JWTSecret string
	JWTExpire string
	DB        DBConfig
	UploadDir string
}

type DBConfig struct {
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	SSLMode  string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("APP_PORT", "8080"),
		JWTSecret: getEnv("JWT_SECRET", "change_me_secret"),
		JWTExpire: getEnv("JWT_EXPIRE_HOURS", "24"),
		UploadDir: getEnv("UPLOAD_DIR", "./uploads"),
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			Name:     getEnv("DB_NAME", "lunchorder"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

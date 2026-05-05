package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/internal/models"
	"github.com/yourusername/lunchorder/internal/websocket"
)

// ─── Menu Handler ────────────────────────────────────────────────────────────

type MenuHandler struct{ DB *gorm.DB }

func (h *MenuHandler) GetSessionMenu(c *gin.Context) {
	id := c.Param("id")
	var session models.MealSession
	if err := h.DB.Preload("Categories.Items").Preload("ComboRule").First(&session, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error: " + err.Error()})
		}
		return
	}
	// Kiểm tra xem đã có đơn nào trong buổi này ở trạng thái 'shipping' hoặc 'delivered' chưa
	var lockedCount int64
	h.DB.Model(&models.Order{}).Where("session_id = ? AND status IN ('shipping', 'delivered')", id).Count(&lockedCount)
	isLocked := lockedCount > 0

	// Gộp kết quả trả về
	c.JSON(http.StatusOK, gin.H{
		"session":   session,
		"is_locked": isLocked,
	})
}

func (h *MenuHandler) CreateCategory(c *gin.Context) {
	sessionID := c.Param("id")
	var cat models.MenuCategory
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cat.SessionID = parseUUID(sessionID)
	h.DB.Create(&cat)
	c.JSON(http.StatusCreated, cat)
}

func (h *MenuHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var cat models.MenuCategory
	h.DB.First(&cat, "id = ?", id)
	c.ShouldBindJSON(&cat)
	h.DB.Save(&cat)
	c.JSON(http.StatusOK, cat)
}

func (h *MenuHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	h.DB.Delete(&models.MenuCategory{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *MenuHandler) CreateItem(c *gin.Context) {
	categoryID := c.Param("id")
	var item models.MenuItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.CategoryID = parseUUID(categoryID)
	h.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func (h *MenuHandler) UpdateItem(c *gin.Context) {
	id := c.Param("id")
	var item models.MenuItem
	h.DB.First(&item, "id = ?", id)
	c.ShouldBindJSON(&item)
	h.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func (h *MenuHandler) DeleteItem(c *gin.Context) {
	id := c.Param("id")
	h.DB.Delete(&models.MenuItem{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *MenuHandler) SaveComboRule(c *gin.Context) {
	sessionID := c.Param("id")
	var rule models.ComboRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	rule.SessionID = parseUUID(sessionID)

	// Upsert: Try to find existing rule for this session
	var existing models.ComboRule
	var err error
	if err = h.DB.Where("session_id = ?", rule.SessionID).First(&existing).Error; err == nil {
		rule.ID = existing.ID
		err = h.DB.Save(&rule).Error
	} else {
		err = h.DB.Create(&rule).Error
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save combo rule: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *MenuHandler) GetComboRule(c *gin.Context) {
	sessionID := c.Param("id")
	var rule models.ComboRule
	if err := h.DB.Where("session_id = ?", sessionID).First(&rule).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "combo rule not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error: " + err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, rule)
}

// ─── Debt Handler ────────────────────────────────────────────────────────────

type DebtHandler struct{ DB *gorm.DB }

func (h *DebtHandler) List(c *gin.Context) {
	var debts []models.Debt
	h.DB.Preload("User").Preload("Order.Session").Preload("Order.MenuItem").
		Where("is_paid = false").Order("created_at desc").Find(&debts)
	c.JSON(http.StatusOK, debts)
}

func (h *DebtHandler) MyDebts(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var debts []models.Debt
	h.DB.Preload("Order.Session").Preload("Order.MenuItem").
		Where("user_id = ?", userID).Order("created_at desc").Find(&debts)
	c.JSON(http.StatusOK, debts)
}

// ─── Payment Handler ─────────────────────────────────────────────────────────

type PaymentHandler struct {
	DB  *gorm.DB
	Hub *websocket.Hub
}

func (h *PaymentHandler) Create(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var log models.PaymentLog
	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.UserID = parseUUID(userID.(string))
	log.Status = "pending"
	h.DB.Create(&log)
	c.JSON(http.StatusCreated, log)
}

func (h *PaymentHandler) List(c *gin.Context) {
	status := c.Query("status")
	var payments []models.PaymentLog
	q := h.DB.Preload("User").Order("created_at desc")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Find(&payments)
	c.JSON(http.StatusOK, payments)
}

func (h *PaymentHandler) Confirm(c *gin.Context) {
	id := c.Param("id")
	adminID, _ := c.Get("user_id")
	adminUUID := parseUUID(adminID.(string))

	var log models.PaymentLog
	if err := h.DB.First(&log, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	log.Status = "confirmed"
	log.ConfirmedBy = &adminUUID
	h.DB.Save(&log)

	// Mark debts as paid (up to the payment amount) using FIFO logic
	var debts []models.Debt
	h.DB.Where("user_id = ? AND is_paid = false", log.UserID).Order("created_at asc").Find(&debts)

	remaining := log.Amount
	for _, d := range debts {
		if remaining <= 0 {
			break
		}

		canPay := d.Amount - d.PaidAmount
		if remaining >= canPay {
			// Pay this debt in full
			remaining -= canPay
			d.PaidAmount = d.Amount
			d.IsPaid = true
			now := time.Now()
			d.PaidAt = &now
		} else {
			// Partial payment for this debt
			d.PaidAmount += remaining
			remaining = 0
		}
		h.DB.Save(&d)

		// Record the allocation
		h.DB.Create(&models.PaymentAllocation{
			PaymentID:       log.ID,
			DebtID:          d.ID,
			AmountAllocated: d.PaidAmount,
		})
	}

	h.Hub.BroadcastMessage(websocket.MsgPaymentConfirmed, gin.H{
		"user_id": log.UserID,
		"amount":  log.Amount,
	})

	c.JSON(http.StatusOK, log)
}

// ─── Dashboard Handler ────────────────────────────────────────────────────────

type DashboardHandler struct{ DB *gorm.DB }

type MonthlyStat struct {
	Month       string  `json:"month"`
	TotalSpent  float64 `json:"total_spent"` // This is company subsidy
	ActualSpent float64 `json:"actual_spent"` // This is actual meal price
	OrderCount  int64   `json:"order_count"`
}

type WeeklyStat struct {
	Week        string  `json:"week"`
	TotalSpent  float64 `json:"total_spent"`
	ActualSpent float64 `json:"actual_spent"`
	OrderCount  int64   `json:"order_count"`
}

func (h *DashboardHandler) Weekly(c *gin.Context) {
	// Group orders by week of the current year
	year := c.DefaultQuery("year", time.Now().Format("2006"))
	var stats []WeeklyStat
	h.DB.Raw(`
		SELECT 
			'Tuần ' || TO_CHAR(order_date, 'IW') as week,
			SUM(company_subsidy) as total_spent,
			SUM(item_price) as actual_spent,
			COUNT(*) as order_count
		FROM orders
		WHERE is_self_cook = false
		  AND status = 'delivered'
		  AND EXTRACT(YEAR FROM order_date) = ?
		GROUP BY week
		ORDER BY week
	`, year).Scan(&stats)
	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) Monthly(c *gin.Context) {
	year := c.DefaultQuery("year", time.Now().Format("2006"))
	var stats []MonthlyStat
	h.DB.Raw(`
		SELECT 
			TO_CHAR(order_date, 'YYYY-MM') as month,
			SUM(company_subsidy) as total_spent,
			SUM(item_price) as actual_spent,
			COUNT(*) as order_count
		FROM orders
		WHERE is_self_cook = false
		  AND status = 'delivered'
		  AND EXTRACT(YEAR FROM order_date) = ?
		GROUP BY TO_CHAR(order_date, 'YYYY-MM')
		ORDER BY month
	`, year).Scan(&stats)
	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) Summary(c *gin.Context) {
	var totalUsers, pendingUsers, totalOrders int64
	var totalDebt, totalSpent, totalSelfCookToPay float64

	h.DB.Model(&models.User{}).Count(&totalUsers)
	h.DB.Model(&models.User{}).Where("status = 'pending'").Count(&pendingUsers)
	h.DB.Model(&models.Order{}).Count(&totalOrders)
	h.DB.Model(&models.Debt{}).Where("is_paid = false").Select("COALESCE(SUM(amount),0)").Scan(&totalDebt)
	h.DB.Model(&models.Order{}).Where("status = 'delivered' AND is_self_cook = false").
		Select("COALESCE(SUM(company_subsidy),0)").Scan(&totalSpent)
	
	// New: Total amount to pay for self-cook employees
	h.DB.Model(&models.SelfCookLog{}).Where("is_paid = false").
		Select("COALESCE(SUM(credit_amount),0)").Scan(&totalSelfCookToPay)

	c.JSON(http.StatusOK, gin.H{
		"total_users":            totalUsers,
		"pending_users":          pendingUsers,
		"total_orders":           totalOrders,
		"total_debt":             totalDebt,
		"total_spent":            totalSpent,
		"total_self_cook_to_pay": totalSelfCookToPay,
	})
}

// ─── Self-Cook Handler ────────────────────────────────────────────────────────

type SelfCookHandler struct{ DB *gorm.DB }

func (h *SelfCookHandler) ListLogs(c *gin.Context) {
	var logs []models.SelfCookLog
	h.DB.Preload("User").Preload("Session").Where("is_paid = false").Order("created_at desc").Find(&logs)
	if logs == nil {
		logs = []models.SelfCookLog{}
	}
	c.JSON(http.StatusOK, logs)
}

func (h *SelfCookHandler) GroupedSummary(c *gin.Context) {
	type UserSubsidy struct {
		UserID       string  `json:"user_id"`
		FullName     string  `json:"full_name"`
		Phone        string  `json:"phone"`
		PaymentQrUrl string  `json:"payment_qr_url"`
		TotalAmount  float64 `json:"total_amount"`
		LogCount     int     `json:"log_count"`
	}
	var results []UserSubsidy

	h.DB.Raw(`
		SELECT 
			u.id as user_id, 
			u.full_name, 
			u.phone, 
			u.payment_qr_url,
			SUM(s.credit_amount) as total_amount,
			COUNT(s.id) as log_count
		FROM self_cook_logs s
		JOIN users u ON s.user_id = u.id
		WHERE s.is_paid = false
		GROUP BY u.id, u.full_name, u.phone, u.payment_qr_url
	`).Scan(&results)

	if results == nil {
		results = []UserSubsidy{}
	}
	c.JSON(http.StatusOK, results)
}

func (h *SelfCookHandler) ConfirmPayment(c *gin.Context) {
	targetUserID := c.Param("userID")
	adminID, _ := c.Get("user_id")
	adminUUID := parseUUID(adminID.(string))
	now := time.Now()

	err := h.DB.Model(&models.SelfCookLog{}).
		Where("user_id = ? AND is_paid = false", targetUserID).
		Updates(map[string]interface{}{
			"is_paid": true,
			"paid_by": adminUUID,
			"paid_at": now,
		}).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment confirmed"})
}

func (h *SelfCookHandler) UpdateUserQR(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var body struct {
		QRUrl string `json:"qr_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Model(&models.User{}).Where("id = ?", userID).Update("payment_qr_url", body.QRUrl)
	c.JSON(http.StatusOK, gin.H{"message": "QR updated"})
}

// ─── Settings Handler ─────────────────────────────────────────────────────────

type SettingsHandler struct{ DB *gorm.DB }

func (h *SettingsHandler) UploadBankQR(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	var qr models.BankQR
	if err := c.ShouldBindJSON(&qr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	qr.AdminID = parseUUID(adminID.(string))
	qr.IsActive = true

	// Deactivate previous QR
	h.DB.Model(&models.BankQR{}).Where("admin_id = ?", adminID).Update("is_active", false)
	h.DB.Create(&qr)
	c.JSON(http.StatusCreated, qr)
}

func (h *SettingsHandler) GetBankQR(c *gin.Context) {
	var qr models.BankQR
	if err := h.DB.Where("is_active = true").Order("created_at desc").First(&qr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no active QR found"})
		return
	}
	c.JSON(http.StatusOK, qr)
}

package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/yourusername/lunchorder/internal/models"
	"github.com/yourusername/lunchorder/internal/websocket"
)

type OrderHandler struct {
	DB  *gorm.DB
	Hub *websocket.Hub
}

type createOrderRequest struct {
	SessionID string   `json:"session_id" binding:"required"`
	ItemIDs   []string `json:"item_ids"` // Mảng các ID món ăn cho combo
	IsSelfCook bool    `json:"is_self_cook"`
	Note       string  `json:"note"`
}

func (h *OrderHandler) Create(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req createOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch session for subsidy
	var session models.MealSession
	if err := h.DB.First(&session, "id = ?", req.SessionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	// Chặn đặt món nếu đã có đơn hàng nào trong buổi này chuyển sang 'shipping' hoặc 'delivered'
	var hasLockedOrder int64
	h.DB.Model(&models.Order{}).Where("session_id = ? AND status IN ('shipping', 'delivered')", req.SessionID).Count(&hasLockedOrder)
	if hasLockedOrder > 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Buổi ăn này đã khóa (đang giao hoặc đã hoàn thành), không thể đặt món thêm!"})
		return
	}

	order := models.Order{
		UserID:         parseUUID(userID.(string)),
		SessionID:      parseUUID(req.SessionID),
		IsSelfCook:     req.IsSelfCook,
		Note:           req.Note,
		CompanySubsidy: session.CompanySubsidy,
		Status:         "pending",
	}

	if !req.IsSelfCook && len(req.ItemIDs) > 0 {
		// Load session with ComboRule to calculate price
		var fullSession models.MealSession
		h.DB.Preload("ComboRule").First(&fullSession, "id = ?", req.SessionID)

		var totalItemPrice float64
		var orderItems []models.OrderItem

		// Fetch all items to get prices
		var items []models.MenuItem
		h.DB.Where("id IN ?", req.ItemIDs).Find(&items)

		// Map to store items for easy access
		itemMap := make(map[string]models.MenuItem)
		for _, item := range items {
			itemMap[item.ID.String()] = item
		}

		// Calculate normal total price and prepare order items
		for _, itemIDStr := range req.ItemIDs {
			item, exists := itemMap[itemIDStr]
			if !exists {
				continue
			}
			totalItemPrice += item.Price
			
			itemID := item.ID
			orderItems = append(orderItems, models.OrderItem{
				ItemID:        &itemID,
				Quantity:      1,
				PriceSnapshot: item.Price,
			})
		}

		// Apply combo pricing if rule exists and is active
		finalPrice := totalItemPrice
		if fullSession.ComboRule != nil && fullSession.ComboRule.IsActive {
			isComboMatch := false
			
			// If there are category-specific rules, validate them
			if fullSession.ComboRule.CategoryRules != "" && fullSession.ComboRule.CategoryRules != "[]" {
				var catRules []struct {
					CategoryID string `json:"category_id"`
					Count      int    `json:"count"`
				}
				if err := json.Unmarshal([]byte(fullSession.ComboRule.CategoryRules), &catRules); err == nil {
					// Count items per category in the order
					orderCatCounts := make(map[string]int)
					
					// Recount carefully to handle duplicates correctly
					for _, itemIDStr := range req.ItemIDs {
						if item, ok := itemMap[itemIDStr]; ok {
							orderCatCounts[item.CategoryID.String()]++
						}
					}

					// Check if all rules are satisfied
					matches := true
					for _, rule := range catRules {
						if orderCatCounts[rule.CategoryID] < rule.Count {
							matches = false
							break
						}
					}
					isComboMatch = matches
				}
			} else {
				// Fallback to simple item count rule
				if len(req.ItemIDs) >= fullSession.ComboRule.RequiredItems {
					isComboMatch = true
				}
			}

			if isComboMatch {
				finalPrice = fullSession.ComboRule.ComboPrice
			}
		}

		order.ItemPrice = finalPrice
		order.Subtotal = finalPrice
		order.Items = orderItems
		
		// Set MenuItemID to the first item for backward compatibility with old UI/mobile
		if len(items) > 0 {
			order.MenuItemID = &items[0].ID
		}

		// Calculate debt
		if finalPrice > session.CompanySubsidy {
			order.DebtAmount = finalPrice - session.CompanySubsidy
		}
	} else if req.IsSelfCook {
		// Self-cook: create credit log
		log := models.SelfCookLog{
			UserID:       parseUUID(userID.(string)),
			SessionID:    parseUUID(req.SessionID),
			CreditAmount: session.CompanySubsidy,
		}
		h.DB.Create(&log)
	}

	if err := h.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create debt record if needed
	if order.DebtAmount > 0 {
		debt := models.Debt{
			UserID:  order.UserID,
			OrderID: order.ID,
			Amount:  order.DebtAmount,
			IsPaid:  false,
		}
		h.DB.Create(&debt)
	}

	// Broadcast realtime
	h.DB.Preload("User").Preload("Session").Preload("MenuItem").First(&order, "id = ?", order.ID)
	h.Hub.BroadcastMessage(websocket.MsgNewOrder, order)

	c.JSON(http.StatusCreated, gin.H{
		"order":       order,
		"debt_amount": order.DebtAmount,
	})
}

func (h *OrderHandler) MyOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var orders []models.Order
	h.DB.Where("user_id = ?", userID).
		Preload("Session").Preload("MenuItem").Preload("Items.MenuItem").
		Order("created_at desc").Find(&orders)
	c.JSON(http.StatusOK, orders)
}

func (h *OrderHandler) List(c *gin.Context) {
	var orders []models.Order
	q := h.DB.Preload("User").Preload("Session").Preload("MenuItem").Preload("Items.MenuItem").Order("created_at desc")

	if sessionID := c.Query("session_id"); sessionID != "" {
		q = q.Where("session_id = ?", sessionID)
	}
	if date := c.Query("date"); date != "" {
		q = q.Where("order_date = ?", date)
	}

	q.Find(&orders)
	c.JSON(http.StatusOK, orders)
}

func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Model(&models.Order{}).Where("id = ?", id).
		Update("status", body.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Broadcast status change
	h.Hub.BroadcastMessage(websocket.MsgOrderStatusChanged, gin.H{
		"order_id": id,
		"status":   body.Status,
	})

	c.JSON(http.StatusOK, gin.H{"message": "status updated", "status": body.Status})
}

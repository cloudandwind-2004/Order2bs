package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// --- User ------------------------------------------------------------------

type User struct {
	ID                    uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FullName              string     `gorm:"size:100;not null" json:"full_name"`
	Phone                 string     `gorm:"size:20;uniqueIndex;not null" json:"phone"`
	RoleInCompany         string     `gorm:"size:50" json:"role_in_company"`
	Role                  string     `gorm:"size:20;default:'user';index;check:role IN ('admin','user')" json:"role"`
	Status                string     `gorm:"size:20;default:'pending';index;check:status IN ('pending','approved','rejected')" json:"status"`
	IsApproved            bool       `gorm:"default:false;index" json:"is_approved"`
	RejectReason          *string    `gorm:"size:500" json:"reject_reason,omitempty"`
	ApprovedAt            *time.Time `json:"approved_at,omitempty"`
	RejectedAt            *time.Time `json:"rejected_at,omitempty"`
	LockedUntil           *time.Time `gorm:"index" json:"locked_until,omitempty"`
	FailedLoginCount      int        `gorm:"default:0" json:"failed_login_count"`
	FailedWindowStartedAt *time.Time `json:"failed_window_started_at,omitempty"`
	PasswordHash          string     `gorm:"not null" json:"-"`
	PaymentQrUrl          string     `json:"payment_qr_url"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// --- AuthLoginAttempt ------------------------------------------------------

type AuthLoginAttempt struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	FailedCount     int        `gorm:"default:0" json:"failed_count"`
	WindowStartedAt *time.Time `json:"window_started_at,omitempty"`
	LockedUntil     *time.Time `json:"locked_until,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (a *AuthLoginAttempt) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// --- BankQrSetting ---------------------------------------------------------


type BankQrSetting struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AdminID     uuid.UUID `gorm:"type:uuid;index" json:"admin_id"`
	BankName    string    `gorm:"size:100" json:"bank_name"`
	AccountNo   string    `gorm:"size:50" json:"account_no"`
	AccountName string    `gorm:"size:100" json:"account_name"`
	QRImageURL  string    `json:"qr_image_url"`
	IsActive    bool      `gorm:"default:true;index" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (b *BankQrSetting) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

func (BankQrSetting) TableName() string {
	return "bank_qr_settings"
}

// Backward-compatible alias used by handlers.
type BankQR = BankQrSetting

// --- MealSession -----------------------------------------------------------

type MealSession struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title          string     `gorm:"size:100" json:"title"`
	Name           string     `gorm:"size:100;not null" json:"name"`
	Description    string     `json:"description"`
	MealDate       *time.Time `json:"meal_date,omitempty"`
	CutoffAt       *time.Time `json:"cutoff_at,omitempty"`
	CompanySubsidy float64    `gorm:"default:0" json:"company_subsidy"`
	StartTime      string     `gorm:"size:10" json:"start_time"`
	EndTime        string     `gorm:"size:10" json:"end_time"`
	ScheduleType   string     `gorm:"size:20" json:"schedule_type"`
	DayOfWeek      string     `json:"day_of_week"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	IsActive       bool       `gorm:"default:true;index" json:"is_active"`
	CreatedBy      uuid.UUID  `gorm:"type:uuid" json:"created_by"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	Categories []MenuCategory `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE" json:"categories,omitempty"`
	ComboRule  *ComboRule   `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE" json:"combo_rule,omitempty"`
}

// --- ComboRule -------------------------------------------------------------

type ComboRule struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SessionID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"session_id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	RequiredItems int       `gorm:"default:3" json:"required_items"`
	ComboPrice    float64   `gorm:"not null" json:"combo_price"`
	IsActive      bool      `gorm:"default:false;index" json:"is_active"`
	Description   string    `json:"description"`
	CategoryRules string    `gorm:"type:text" json:"category_rules"` // JSON string: [{"category_id": "...", "count": 1}, ...]
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (c *ComboRule) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (m *MealSession) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

// --- MenuCategory ----------------------------------------------------------

type MenuCategory struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SessionID    uuid.UUID `gorm:"type:uuid;not null;index" json:"session_id"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Items []MenuItem `gorm:"foreignKey:CategoryID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

func (m *MenuCategory) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

// --- MenuItem --------------------------------------------------------------

type MenuItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CategoryID  uuid.UUID `gorm:"type:uuid;not null;index" json:"category_id"`
	Name        string    `gorm:"size:200;not null" json:"name"`
	Price       float64   `gorm:"not null" json:"price"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	IsAvailable bool      `gorm:"default:true;index" json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (m *MenuItem) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

// --- Order -----------------------------------------------------------------

type Order struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	SessionID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"session_id"`
	MenuItemID     *uuid.UUID `gorm:"type:uuid" json:"menu_item_id"` // nil nếu tự nấu
	IsSelfCook     bool       `gorm:"default:false;index" json:"is_self_cook"`
	Status         string     `gorm:"size:30;default:'pending';index;check:status IN ('pending','confirmed','shipping','delivered','cancelled')" json:"status"`
	// pending | confirmed | shipping | delivered | cancelled
	Subtotal       float64    `gorm:"default:0" json:"subtotal"`
	Note           string     `json:"note"`
	ItemPrice      float64    `json:"item_price"`
	CompanySubsidy float64    `json:"company_subsidy"`
	DebtAmount     float64    `gorm:"default:0" json:"debt_amount"`
	CancelledBy    *string    `gorm:"size:20" json:"cancelled_by,omitempty"`
	CancelledAt    *time.Time `json:"cancelled_at,omitempty"`
	OrderDate      time.Time `json:"order_date"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	User     *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Session  *MealSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	MenuItem *MenuItem    `gorm:"foreignKey:MenuItemID" json:"menu_item,omitempty"`
	Items    []OrderItem  `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	if o.OrderDate.IsZero() {
		o.OrderDate = time.Now()
	}
	return nil
}

// --- OrderItem -------------------------------------------------------------

type OrderItem struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"order_id"`
	ItemID        *uuid.UUID `gorm:"type:uuid" json:"item_id,omitempty"`
	Quantity      int        `gorm:"default:1" json:"quantity"`
	Note          string     `json:"note"`
	PriceSnapshot float64    `gorm:"default:0" json:"price_snapshot"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`

	MenuItem *MenuItem `gorm:"foreignKey:ItemID" json:"menu_item,omitempty"`
}

func (o *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// --- OrderStatusHistory ----------------------------------------------------

type OrderStatusHistory struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"order_id"`
	FromStatus string     `gorm:"size:30" json:"from_status"`
	ToStatus   string     `gorm:"size:30;not null" json:"to_status"`
	ChangedBy  *uuid.UUID `gorm:"type:uuid" json:"changed_by,omitempty"`
	ChangedAt  time.Time  `gorm:"autoCreateTime" json:"changed_at"`
}

func (o *OrderStatusHistory) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// --- Debt ------------------------------------------------------------------

type Debt struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	OrderID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"order_id"`
	Amount    float64    `gorm:"not null" json:"amount"`
	PaidAmount float64   `gorm:"default:0" json:"paid_amount"`
	IsPaid    bool       `gorm:"default:false;index" json:"is_paid"`
	PaidAt    *time.Time `json:"paid_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	User  *User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Order *Order `gorm:"foreignKey:OrderID" json:"order,omitempty"`
}

func (d *Debt) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

// --- Payment ---------------------------------------------------------------

type Payment struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	Amount      float64    `gorm:"not null" json:"amount"`
	Note        string     `json:"note"`
	ProofURL    string     `gorm:"column:proof_url" json:"proof_url"`
	ProofImage  string     `gorm:"column:proof_image" json:"proof_image"`
	ProofMimeType string   `gorm:"size:100" json:"proof_mime_type"`
	ProofSizeBytes int64   `json:"proof_size_bytes"`
	ProofRetentionUntil *time.Time `json:"proof_retention_until,omitempty"`
	ConfirmedBy *uuid.UUID `gorm:"type:uuid" json:"confirmed_by"`
	ConfirmedAt *time.Time `json:"confirmed_at"`
	Status      string     `gorm:"size:20;default:'pending';index;check:status IN ('pending','confirmed')" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

func (Payment) TableName() string {
	return "payments"
}

// Backward-compatible alias used by handlers.
type PaymentLog = Payment

// --- PaymentProof ----------------------------------------------------------

type PaymentProof struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PaymentID uuid.UUID `gorm:"type:uuid;not null;index" json:"payment_id"`
	FileName  string    `gorm:"size:255" json:"file_name"`
	MimeType  string    `gorm:"size:100" json:"mime_type"`
	SizeBytes int64     `json:"size_bytes"`
	StorageKey string   `gorm:"size:255" json:"storage_key"`
	CreatedAt time.Time `json:"created_at"`
}

func (p *PaymentProof) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// --- PaymentAllocation -----------------------------------------------------

type PaymentAllocation struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PaymentID       uuid.UUID `gorm:"type:uuid;not null;index" json:"payment_id"`
	DebtID          uuid.UUID `gorm:"type:uuid;not null;index" json:"debt_id"`
	AmountAllocated float64   `gorm:"not null" json:"amount_allocated"`
	CreatedAt       time.Time `json:"created_at"`
}

func (p *PaymentAllocation) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// --- DashboardSummarySnapshot ---------------------------------------------

type DashboardSummarySnapshot struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SnapshotAt   time.Time `gorm:"index" json:"snapshot_at"`
	TotalUsers   int64     `json:"total_users"`
	PendingUsers int64     `json:"pending_users"`
	TotalOrders  int64     `json:"total_orders"`
	TotalDebt    float64   `json:"total_debt"`
	TotalSpent   float64   `json:"total_spent"`
	CreatedAt    time.Time `json:"created_at"`
}

func (d *DashboardSummarySnapshot) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	if d.SnapshotAt.IsZero() {
		d.SnapshotAt = time.Now()
	}
	return nil
}

// --- DashboardMonthlyStat --------------------------------------------------

type DashboardMonthlyStat struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Year       int       `gorm:"index" json:"year"`
	Month      int       `gorm:"index" json:"month"`
	OrderCount int64     `json:"order_count"`
	TotalSpent float64   `json:"total_spent"`
	Timezone   string    `gorm:"size:50;default:'Asia/Ho_Chi_Minh'" json:"timezone"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (d *DashboardMonthlyStat) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

func (DashboardMonthlyStat) TableName() string {
	return "dashboard_monthly_stats"
}

// --- SelfCookLog -----------------------------------------------------------

type SelfCookLog struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	SessionID    uuid.UUID `gorm:"type:uuid;not null;index" json:"session_id"`
	CreditAmount float64   `json:"credit_amount"`
	LogDate      time.Time `json:"log_date"`
	IsPaid       bool      `gorm:"default:false;index" json:"is_paid"`
	PaidBy       *uuid.UUID `gorm:"type:uuid" json:"paid_by,omitempty"`
	PaidAt       *time.Time `json:"paid_at,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	User    *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Session *MealSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
}

func (s *SelfCookLog) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.LogDate.IsZero() {
		s.LogDate = time.Now()
	}
	return nil
}

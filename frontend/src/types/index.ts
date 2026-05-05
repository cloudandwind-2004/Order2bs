// ─── User ─────────────────────────────────────────────────────
export interface User {
  id: string;
  full_name: string;
  phone: string;
  role_in_company: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  payment_qr_url?: string;
  created_at: string;
  updated_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Meal Session ─────────────────────────────────────────────
export interface MealSession {
  id: string;
  name: string;
  description: string;
  company_subsidy: number;
  start_time: string; // "10:30"
  end_time: string;   // "12:00"
  schedule_type: 'daily' | 'weekly' | 'once';
  day_of_week: string; // JSON array
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  categories?: MenuCategory[];
  combo_rule?: ComboRule;
}

// ─── Menu ─────────────────────────────────────────────────────
export interface MenuCategory {
  id: string;
  session_id: string;
  name: string;
  display_order: number;
  created_at: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at: string;
  category_name?: string; // populated client-side for display
}

// ─── Combo Rule ───────────────────────────────────────────────
export interface ComboRule {
  id?: string;
  session_id: string;
  name: string;           // e.g. "Combo 3 món"
  required_items: number; // e.g. 3
  combo_price: number;    // e.g. 45000
  is_active: boolean;
  description?: string;
  category_rules?: string; // JSON string
}

// ─── Order ────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  session_id: string;
  menu_item_id?: string;
  is_self_cook: boolean;
  status: OrderStatus;
  note?: string;
  item_price: number;
  company_subsidy: number;
  debt_amount: number;
  order_date: string;
  created_at: string;
  updated_at: string;
  user?: User;
  session?: MealSession;
  menu_item?: MenuItem;
}

// ─── Debt ─────────────────────────────────────────────────────
export interface Debt {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string;
  created_at: string;
  user?: User;
  order?: Order;
}

// ─── Payment ──────────────────────────────────────────────────
export interface PaymentLog {
  id: string;
  user_id: string;
  amount: number;
  note?: string;
  proof_image?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  status: 'pending' | 'confirmed';
  created_at: string;
  user?: User;
}

// ─── Bank QR ──────────────────────────────────────────────────
export interface BankQR {
  id: string;
  admin_id: string;
  bank_name: string;
  account_no: string;
  account_name: string;
  qr_image_url: string;
  is_active: boolean;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardSummary {
  total_users: number;
  pending_users: number;
  total_orders: number;
  total_debt: number;
  total_spent: number;
  total_self_cook_to_pay: number;
}

export interface MonthlyStat {
  month: string;
  total_spent: number;  // Subsidy
  actual_spent: number; // Total price
  order_count: number;
}

export interface WeeklyStat {
  week: string;
  total_spent: number;  // Subsidy
  actual_spent: number; // Total price
  order_count: number;
}

// ─── WebSocket ────────────────────────────────────────────────
export interface WSMessage<T = unknown> {
  type: string;
  payload: T;
}

export const WS_EVENTS = {
  NEW_ORDER: 'NEW_ORDER',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_ENDED: 'SESSION_ENDED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
} as const;

// ─── Self-Cook ────────────────────────────────────────────────
export interface SelfCookLog {
  id: string;
  user_id: string;
  session_id: string;
  credit_amount: number;
  log_date: string;
  created_at: string;
  user?: User;
  session?: MealSession;
}

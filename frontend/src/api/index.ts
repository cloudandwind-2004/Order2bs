import api from './client';
import type {
  LoginResponse, User, MealSession, MenuCategory,
  Order, OrderStatus, Debt, PaymentLog, BankQR,
  DashboardSummary, MonthlyStat, WeeklyStat, SelfCookLog,
} from '@/types';

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: { full_name: string; phone: string; password: string; role_in_company: string }) =>
    api.post<{ message: string; user: User }>('/api/auth/register', data),

  login: (data: { phone: string; password: string }) =>
    api.post<LoginResponse>('/api/auth/login', data),

  me: () => api.get<User>('/api/auth/me'),
};

// ─── Admin - Users ─────────────────────────────────────────────
export const adminUserApi = {
  list: (status?: string) => api.get<User[]>('/api/admin/users', { params: { status } }),
  approve: (id: string) => api.patch(`/api/admin/users/${id}/approve`),
  reject: (id: string) => api.patch(`/api/admin/users/${id}/reject`),
  delete: (id: string) => api.delete(`/api/admin/users/${id}`),
};

// ─── Sessions ──────────────────────────────────────────────────
export const sessionApi = {
  listAdmin: () => api.get<MealSession[]>('/api/admin/sessions'),
  listActive: () => api.get<MealSession[]>('/api/sessions/active'),
  getMenu: (id: string) => api.get<{ session: MealSession; is_locked: boolean }>(`/api/sessions/${id}/menu`),
  create: (data: Partial<MealSession>) => api.post<MealSession>('/api/admin/sessions', data),
  update: (id: string, data: Partial<MealSession>) => api.put<MealSession>(`/api/admin/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/sessions/${id}`),
};

// ─── Menu ──────────────────────────────────────────────────────
export const menuApi = {
  createCategory: (sessionId: string, data: { name: string; display_order?: number }) =>
    api.post<MenuCategory>(`/api/admin/sessions/${sessionId}/categories`, data),
  updateCategory: (id: string, data: Partial<MenuCategory>) =>
    api.put<MenuCategory>(`/api/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/api/admin/categories/${id}`),
  createItem: (categoryId: string, data: { name: string; price: number }) =>
    api.post(`/api/admin/categories/${categoryId}/items`, data),
  updateItem: (id: string, data: { name?: string; price?: number; is_available?: boolean }) =>
    api.put(`/api/admin/items/${id}`, data),
  deleteItem: (id: string) => api.delete(`/api/admin/items/${id}`),
  saveComboRule: (sessionId: string, data: any) =>
    api.post(`/api/admin/sessions/${sessionId}/combo`, data),
};

// ─── Orders ────────────────────────────────────────────────────
export const orderApi = {
  create: (data: { session_id: string; menu_item_id?: string; item_ids?: string[]; is_self_cook?: boolean; note?: string }) =>
    api.post<{ order: Order; debt_amount: number }>('/api/orders', data),
  myOrders: () => api.get<Order[]>('/api/orders/my'),
  listAdmin: (params?: { session_id?: string; date?: string }) =>
    api.get<Order[]>('/api/admin/orders', { params }),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch(`/api/admin/orders/${id}/status`, { status }),
};

// ─── Debts ─────────────────────────────────────────────────────
export const debtApi = {
  myDebts: () => api.get<Debt[]>('/api/debts/my'),
  listAdmin: () => api.get<Debt[]>('/api/admin/debts'),
};

// ─── Payments ──────────────────────────────────────────────────
export const paymentApi = {
  create: (data: { amount: number; note?: string; proof_image?: string }) =>
    api.post<PaymentLog>('/api/payments', data),
  listAdmin: (status?: string) => api.get<PaymentLog[]>('/api/admin/payments', { params: { status } }),
  confirm: (id: string) => api.post<PaymentLog>(`/api/admin/payments/${id}/confirm`),
};

// ─── Bank QR ───────────────────────────────────────────────────
export const settingsApi = {
  getBankQR: () => api.get<BankQR>('/api/bank-qr'),
  saveBankQR: (data: Partial<BankQR>) => api.post<BankQR>('/api/admin/settings/bank-qr', data),
};

// ─── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/api/admin/dashboard/summary'),
  monthly: (year?: number) => api.get<MonthlyStat[]>('/api/admin/dashboard/monthly', { params: { year } }),
  weekly: (year?: number) => api.get<WeeklyStat[]>('/api/admin/dashboard/weekly', { params: { year } }),
};

// ─── Self-Cook ──────────────────────────────────────────────────
export const selfCookApi = {
  listAdmin: () => api.get<SelfCookLog[]>('/api/admin/self-cooks'),
  summaryAdmin: () => api.get<any[]>('/api/admin/self-cooks/summary'),
  confirmPayment: (userId: string) => api.post(`/api/admin/self-cooks/${userId}/confirm`),
  updateQR: (qrUrl: string) => api.patch('/api/auth/qr', { qr_url: qrUrl }),
};

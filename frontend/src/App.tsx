import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Public
import LoginPage from '@/components/features/auth/LoginPage';
import RegisterPage from '@/components/features/auth/RegisterPage';
import PendingPage from '@/components/features/auth/PendingPage';

// User
import UserLayout from '@/components/layout/UserLayout';
import SessionListPage from '@/components/features/user/SessionList/SessionListPage';
import OrderFormPage from '@/components/features/user/OrderForm/OrderFormPage';
import MyOrdersPage from '@/components/features/user/OrderForm/MyOrdersPage';
import MyDebtPage from '@/components/features/user/MyDebt/MyDebtPage';
import ProfileSettingsPage from '@/components/features/user/Profile/ProfileSettingsPage';

// Admin
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardPage from '@/components/features/admin/Dashboard/DashboardPage';
import UserManagementPage from '@/components/features/admin/UserManagement/UserManagementPage';
import MealSessionPage from '@/components/features/admin/MealSession/MealSessionPage';
import MenuBuilderPage from '@/components/features/admin/MenuBuilder/MenuBuilderPage';
import OrderBoardPage from '@/components/features/admin/OrderBoard/OrderBoardPage';
import DebtManagerPage from '@/components/features/admin/DebtManager/DebtManagerPage';
import QRSettingsPage from '@/components/features/admin/QRSettings/QRSettingsPage';
import SelfCookPage from '@/components/features/admin/SelfCook/SelfCookPage';

// Guards
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.status === 'pending') return <Navigate to="/pending" replace />;
  if (user?.status === 'rejected') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequirePending({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.status === 'approved') {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/pending" element={<RequirePending><PendingPage /></RequirePending>} />

        {/* User */}
        <Route path="/" element={<RequireAuth><UserLayout /></RequireAuth>}>
          <Route index element={<SessionListPage />} />
          <Route path="session/:id" element={<OrderFormPage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="my-debt" element={<MyDebtPage />} />
          <Route path="settings" element={<ProfileSettingsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="sessions" element={<MealSessionPage />} />
          <Route path="sessions/:id/menu" element={<MenuBuilderPage />} />
          <Route path="orders" element={<OrderBoardPage />} />
          <Route path="debts" element={<DebtManagerPage />} />
          <Route path="settings" element={<QRSettingsPage />} />
          <Route path="self-cooks" element={<SelfCookPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

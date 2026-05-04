import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingBag,
  CreditCard, Settings, LogOut, QrCode, ChefHat
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/sessions', label: 'Buổi ăn', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/debts', label: 'Công nợ', icon: CreditCard },
  { to: '/admin/self-cooks', label: 'Tiền phải trả', icon: ChefHat },
  { to: '/admin/settings', label: 'QR Ngân hàng', icon: QrCode },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').pop()?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🌸 2BS Admin</div>

        {/* Admin Info Block */}
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
            {initials}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(249,232,238,0.45)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Quản trị viên
          </div>
          <div style={{ fontWeight: 700, color: '#F9E8EE', fontSize: '0.9rem', marginTop: 3 }}>
            {user?.full_name}
          </div>
        </div>

        {/* Section label */}
        <div style={{ fontSize: '0.65rem', color: 'rgba(249,232,238,0.3)', letterSpacing: '2px', padding: '0 14px 8px', textTransform: 'uppercase' }}>
          Chức năng
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

        <NavLink to="/" className="nav-item" style={{ color: 'rgba(249,232,238,0.45)' }}>
          <ShoppingBag size={17} /> Giao diện nhân viên
        </NavLink>

        <button
          className="nav-item logout-btn"
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', 
            color: 'var(--c-primary-light)', 
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            width: '100%',
            justifyContent: 'flex-start',
            borderRadius: 0,
            transition: 'all 0.3s'
          }}
        >
          <LogOut size={17} /> <span style={{ fontWeight: 800 }}>Đăng xuất</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

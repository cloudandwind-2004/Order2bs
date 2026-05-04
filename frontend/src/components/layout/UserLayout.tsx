import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef } from 'react';
import { Home, ShoppingBag, Wallet, LogOut, QrCode, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Đặt món', icon: Home, end: true },
  { to: '/my-orders', label: 'Đơn của tôi', icon: ShoppingBag },
  { to: '/my-debt', label: 'Công nợ', icon: Wallet },
  { to: '/settings', label: 'Cài đặt QR', icon: QrCode },
];

// Cherry Blossom Petal Canvas Animation
function SakuraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Petal = {
      x: number; y: number;
      size: number; speed: number;
      angle: number; angleSpeed: number;
      sway: number; swaySpeed: number; swayOffset: number;
      opacity: number; fadeSpeed: number;
      color: string;
    };

    const colors = ['#F2A7BE', '#F9C4D2', '#FFD6E4', '#E8A4B8', '#FADADD', '#FFC8D8'];

    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 10 + 6,
      speed: Math.random() * 1.5 + 0.8,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * 80 + 40,
      swaySpeed: Math.random() * 0.015 + 0.008,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.6 + 0.4,
      fadeSpeed: Math.random() * 0.003 + 0.001,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    const drawFlower = (ctx: CanvasRenderingContext2D, p: Petal) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      
      // Draw 5 petals
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * 72) * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Each petal (heart-like shape pointing outward)
        ctx.bezierCurveTo(-p.size * 0.5, -p.size * 1.5, -p.size * 1.5, -p.size * 0.5, 0, 0);
        ctx.bezierCurveTo(p.size * 1.5, -p.size * 0.5, p.size * 0.5, -p.size * 1.5, 0, 0);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
      
      // Sakura center (Yellow stamens)
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#fceabb'; // Light gold
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#f39c12'; // Darker gold
      ctx.fill();

      ctx.restore();
    };

    const petals: Petal[] = [];
    const MAX_PETALS = 25;
    let frame = 0;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Spawn petals gradually
      if (petals.length < MAX_PETALS && frame % 18 === 0) {
        petals.push(createPetal());
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.speed;
        p.x += Math.sin(frame * p.swaySpeed + p.swayOffset) * 0.8;
        p.angle += p.angleSpeed;

        // Fade out near bottom
        if (p.y > canvas.height * 0.75) {
          p.opacity -= p.fadeSpeed * 3;
        }

        if (p.opacity <= 0 || p.y > canvas.height + 20) {
          petals.splice(i, 1);
          continue;
        }

        drawFlower(ctx, p);
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
}

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.full_name?.split(' ').pop()?.charAt(0)?.toUpperCase() || '🌸';

  return (
    <div className="app-layout">
      {/* Falling Cherry Blossoms */}
      <SakuraCanvas />

      <aside className="sidebar">
        <div className="sidebar-logo">🌸 2BS Order</div>

        {/* User Info Block */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(249,232,238,0.5)', fontWeight: 600 }}>
            {user?.role_in_company || 'Nhân viên'}
          </div>
          <div style={{ fontWeight: 700, color: '#F9E8EE', fontSize: '0.92rem', marginTop: 2 }}>
            {user?.full_name}
          </div>
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

          {user?.role === 'admin' && (
            <div style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-4)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(249,232,238,0.35)', letterSpacing: '2px', padding: '0 14px 6px', textTransform: 'uppercase' }}>
                Quản trị
              </div>
              <NavLink to="/admin" className="nav-item" style={{ color: '#FFD6E4' }}>
                <LayoutDashboard size={17} /> Trang Quản Trị
              </NavLink>
            </div>
          )}
        </nav>

        <button 
          className="nav-item logout-btn" 
          onClick={handleLogout} 
          style={{ 
            marginTop: 'auto', 
            color: 'var(--c-primary-light)', 
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 'var(--sp-4)',
            paddingBottom: 'var(--sp-4)',
            width: '100%',
            justifyContent: 'flex-start',
            borderRadius: 0,
            transition: 'all 0.3s'
          }}
        >
          <LogOut size={17} /> <span style={{ fontWeight: 800 }}>Đăng xuất</span>
        </button>
      </aside>

      <main className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        <Outlet />
      </main>
    </div>
  );
}

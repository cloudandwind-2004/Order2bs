import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';

// Sakura Falling Effect Component
function SakuraFallingEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type Petal = { x: number; y: number; size: number; speed: number; angle: number; angleSpeed: number; swaySpeed: number; swayOffset: number; opacity: number; fadeSpeed: number; color: string; };
    const colors = ['#F2A7BE', '#F9C4D2', '#FFD6E4', '#E8A4B8', '#FADADD'];
    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width, y: -20, size: Math.random() * 8 + 4, speed: Math.random() * 1.2 + 0.6,
      angle: Math.random() * Math.PI * 2, angleSpeed: (Math.random() - 0.5) * 0.03, swaySpeed: Math.random() * 0.01 + 0.005,
      swayOffset: Math.random() * Math.PI * 2, opacity: Math.random() * 0.6 + 0.2, fadeSpeed: Math.random() * 0.002 + 0.001,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    const petals: Petal[] = [];
    const MAX_PETALS = 35;
    let frame = 0, animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (petals.length < MAX_PETALS && frame % 20 === 0) petals.push(createPetal());
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]; p.y += p.speed; p.x += Math.sin(frame * p.swaySpeed + p.swayOffset) * 0.5; p.angle += p.angleSpeed;
        if (p.y > canvas.height * 0.8) p.opacity -= p.fadeSpeed * 2.5;
        if (p.opacity <= 0 || p.y > canvas.height + 20) { petals.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        for (let j = 0; j < 5; j++) {
          ctx.save(); ctx.rotate((j * 72) * Math.PI / 180);
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size * 0.5, -p.size * 1.5, -p.size * 1.5, -p.size * 0.5, 0, 0);
          ctx.bezierCurveTo(p.size * 1.5, -p.size * 0.5, p.size * 0.5, -p.size * 1.5, 0, 0);
          ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2); ctx.fillStyle = '#fceabb'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2); ctx.fillStyle = '#f39c12'; ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }} />;
}

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ phone, password });
      setAuth(res.data.token, res.data.user);
      toast.success(`Chào mừng, ${res.data.user.full_name}! 🌸`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch {
      toast.error('Sai số điện thoại hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FDF8F5', overflow: 'hidden', position: 'fixed', top: 0, left: 0
    }}>
      {/* Dynamic Falling Effect Only */}
      <SakuraFallingEffect />

      {/* Main Login Card - Clean and Minimalist */}
      <div className="card shadow-lg animate-fadein" style={{
        width: '100%', maxWidth: '420px', padding: '48px 40px',
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(15px)',
        borderRadius: '36px', border: '1px solid rgba(232, 213, 220, 0.6)',
        zIndex: 10, boxShadow: '0 30px 70px rgba(44, 26, 36, 0.12)', margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 10, animation: 'float 4s ease-in-out infinite' }}>🌸</div>
          <h1 style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: '#2C1A24', letterSpacing: '1px' }}>
            2BS Order
          </h1>
          <p style={{ color: '#8A6070', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase' }}>ランチ注文システム</p>
          <div style={{ marginTop: 16, color: '#C9748F', letterSpacing: '8px', fontSize: '0.8rem', opacity: 0.5 }}>──── ✿ ────</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="input-group">
            <label style={{ color: '#8A6070', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', marginBottom: 8 }}>📱 SỐ ĐIỆN THOẠI</label>
            <input className="input" type="tel" placeholder="09xx xxx xxx" value={phone}
              onChange={e => setPhone(e.target.value)} required 
              style={{ height: 56, borderRadius: '18px', background: '#FDF8F5', border: '1.5px solid #E8D5DC', padding: '0 20px', fontSize: '1rem' }} />
          </div>
          <div className="input-group">
            <label style={{ color: '#8A6070', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', marginBottom: 8 }}>🔐 MẬT KHẨU</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required 
              style={{ height: 56, borderRadius: '18px', background: '#FDF8F5', border: '1.5px solid #E8D5DC', padding: '0 20px', fontSize: '1rem' }} />
          </div>
          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
            style={{ height: 64, borderRadius: '20px', fontWeight: 900, fontSize: '1.15rem', background: 'linear-gradient(135deg, #C9748F 0%, #A0506A 100%)', marginTop: 12 }}>
            {loading ? <span className="spinner" style={{ width: 26, height: 26, borderWidth: 3 }} /> : '🌸 ĐĂNG NHẬP NGAY'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: '1rem', color: '#8A6070' }}>
          Bạn mới tham gia? <Link to="/register" style={{ color: '#C9748F', fontWeight: 900, textDecoration: 'underline' }}>Đăng ký ngay 🌸</Link>
        </p>
      </div>

      <style>{`
        body, html { margin: 0; padding: 0; overflow: hidden; background: #FDF8F5; }
        .input:focus { border-color: #C9748F !important; background: #fff !important; box-shadow: 0 0 0 5px rgba(201, 116, 143, 0.15) !important; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}

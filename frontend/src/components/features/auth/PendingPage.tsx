import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';

export default function PendingPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center', 
      background: '#FDF8F5',
      padding: 'var(--sp-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        bottom: -50, right: -50,
        width: 300, height: 300,
        background: 'var(--c-primary-soft)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.5,
        zIndex: 0
      }} />

      <div className="card" style={{ 
        maxWidth: 480, 
        width: '100%', 
        textAlign: 'center',
        border: 'none',
        borderRadius: 'var(--r-2xl)',
        boxShadow: 'var(--shadow-lg)',
        background: '#fff',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg, var(--c-primary), var(--c-accent), var(--c-primary))' }} />
        
        <div className="card-body" style={{ padding: 'var(--sp-12)' }}>
          <div style={{ 
            width: 80, height: 80, background: 'var(--c-bg-alt)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 24px',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <Clock size={40} color="var(--c-primary)" />
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 8 }}>
            ✦ 承認待ち ✦
          </div>
          
          <h2 style={{ marginBottom: 'var(--sp-2)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--c-text)' }}>
            Đang chờ duyệt
          </h2>
          
          <div className="jp-divider" style={{ width: '40%', margin: '16px auto' }} />
          
          <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            Chào mừng bạn đến với <span style={{ color: 'var(--c-primary)', fontWeight: 700 }}>2BS Order</span>! <br/>
            Tài khoản của bạn đang được ban quản trị xem xét để đảm bảo an toàn hệ thống. 
            Quá trình này có thể mất một vài phút.
          </p>
          
          <div style={{ 
            marginTop: 'var(--sp-8)', 
            padding: '16px', 
            background: 'var(--c-bg)', 
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--c-border-light)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem'
          }}>
             <span style={{ fontSize: '1.2rem' }}>🏮</span>
             <span>Vui lòng kiểm tra lại sau khi Admin chốt danh sách nhé!</span>
          </div>

          <div style={{ marginTop: 'var(--sp-10)' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '10px 32px' }}
              onClick={() => { logout(); navigate('/login'); }}
            >
              <LogOut size={16} style={{marginRight: 8}} /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

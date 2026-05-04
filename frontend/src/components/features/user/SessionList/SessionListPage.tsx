import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionApi } from '@/api';
import { MealSession } from '@/types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Clock } from 'lucide-react';

export default function SessionListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<MealSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.listActive()
      .then(res => setSessions(res.data))
      .catch(() => toast.error('Không thể tải danh sách buổi ăn'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌸</div>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>
          Đang tải...
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadein">
      {/* Japanese-style header */}
      <div className="page-header" style={{ paddingBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ いただきます
            </div>
            <h1 className="page-title">🍱 Chọn buổi ăn</h1>
            <p className="page-subtitle">Chọn một buổi ăn đang mở để bắt đầu đặt món.</p>
          </div>
          <div style={{
            background: 'var(--c-primary-soft)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--sp-3) var(--sp-4)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--c-primary-dark)',
          }}>
            <div style={{ fontSize: '1.2rem' }}>🌸</div>
            <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {/* QR Warning */}
      {!user?.payment_qr_url && (
        <div style={{
          background: 'linear-gradient(135deg, #FBF4E6, #FDF8EE)',
          color: '#9A7000',
          padding: 'var(--sp-4)',
          borderRadius: 'var(--r-lg)',
          marginBottom: 'var(--sp-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          border: '1px solid rgba(212, 168, 83, 0.3)',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(212, 168, 83, 0.1)',
          transition: 'all 0.2s ease',
        }} onClick={() => navigate('/settings')}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Chưa cài đặt mã QR nhận tiền!</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Bấm vào đây để cài đặt ngay, giúp Admin chuyển tiền trợ cấp cho bạn dễ dàng hơn.</div>
          </div>
          <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>›</span>
        </div>
      )}

      {/* Session Grid */}
      {sessions.length === 0 ? (
        <div style={{
          background: 'var(--c-surface)',
          borderRadius: 'var(--r-xl)',
          padding: 'var(--sp-12)',
          textAlign: 'center',
          border: '1px dashed var(--c-border)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-4)' }}>🍃</div>
          <h3 style={{ color: 'var(--c-text-muted)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
            Chưa có buổi ăn nào đang mở
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--c-text-light)' }}>
            しばらくお待ちください · Vui lòng kiểm tra lại sau nhé!
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {sessions.map((session, idx) => (
            <Link
              key={session.id}
              to={`/session/${session.id}`}
              className="card"
              style={{
                textDecoration: 'none',
                animationDelay: `${idx * 0.08}s`,
              }}
            >
              <div style={{
                height: 6,
                background: `linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light))`,
                opacity: 0.7,
              }} />
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>🥢</div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--c-success-bg)',
                    color: 'var(--c-success)',
                    border: '1px solid rgba(91, 155, 107, 0.3)',
                  }}>
                    ✓ Đang mở
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 style={{ marginBottom: 'var(--sp-1)', fontSize: '1.05rem' }}>{session.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
                    {session.description || 'Buổi ăn hôm nay'}
                  </p>
                </div>

                {/* Info Block */}
                <div style={{
                  background: 'var(--c-bg)',
                  borderRadius: 'var(--r-md)',
                  padding: 'var(--sp-3)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--c-border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--c-text-muted)' }}>🎁 Trợ cấp</span>
                    <span style={{ fontWeight: 800, color: 'var(--c-primary-dark)', fontSize: '0.95rem' }}>
                      {(session?.company_subsidy || 0).toLocaleString()}đ
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Thời gian
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {session.start_time} – {session.end_time}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="btn btn-primary w-full" style={{ marginTop: 'var(--sp-1)' }}>
                  🌸 Đặt món ngay
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

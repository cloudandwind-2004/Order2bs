import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionApi } from '@/api';
import { MealSession } from '@/types';
import { Plus, Edit2, Menu as MenuIcon, Power, Clock, Banknote, CalendarDays, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MealSessionPage() {
  const [sessions, setSessions] = useState<MealSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Partial<MealSession> | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    type: 'delete' | 'close';
    name: string;
  } | null>(null);

  const fetchSessions = () => {
    setLoading(true);
    sessionApi.listAdmin()
      .then(res => setSessions(res.data))
      .catch(() => toast.error('Không thể tải danh sách buổi ăn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    if (editingSession.start_time && editingSession.end_time && editingSession.end_time <= editingSession.start_time) {
      toast.error('Giờ kết thúc phải lớn hơn giờ bắt đầu! (Định dạng 24h)');
      return;
    }

    try {
      if (editingSession.id) {
        await sessionApi.update(editingSession.id, editingSession);
        toast.success('Đã cập nhật buổi ăn thành công 🌸');
      } else {
        await sessionApi.create(editingSession);
        toast.success('Đã tạo buổi ăn mới 🌸');
      }
      setShowModal(false);
      fetchSessions();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(msg);
    }
  };

  const executeToggleActive = async (id: string, isActive: boolean) => {
    try {
      await sessionApi.update(id, { is_active: !isActive });
      toast.success(isActive ? 'Đã đóng buổi ăn' : 'Đã mở buổi ăn 🌸');
      setConfirmModal(null);
      fetchSessions();
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 食事セッション
            </div>
            <h1 className="page-title">🍴 Quản lý buổi ăn</h1>
            <p className="page-subtitle">Tạo và điều phối các đợt đặt cơm trong ngày.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => { 
               setEditingSession({ name: '', description: '', company_subsidy: 30000, start_time: '08:00', end_time: '11:00', is_active: true }); 
               setShowModal(true); 
            }}
            style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)' }}
          >
            <Plus size={18} strokeWidth={3} /> Thêm buổi mới
          </button>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div className="grid-3">
        {loading ? (
          <div className="loading-overlay" style={{ gridColumn: 'span 3', minHeight: 300 }}><div className="spinner" /></div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 3', border: '1.5px dashed var(--c-border)' }}>
             <div className="card-body empty-state" style={{ padding: 'var(--sp-12)' }}>
                <div style={{ fontSize: '3rem' }}>🍵</div>
                <p>Chưa có buổi ăn nào được tạo.</p>
             </div>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="card" style={{ border: 'none', borderRadius: 'var(--r-xl)' }}>
              <div style={{ height: 6, background: session.is_active ? 'var(--c-success)' : 'var(--c-border)' }} />
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 'var(--r-md)', 
                    background: 'var(--c-bg-alt)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>
                    🍲
                  </div>
                  <span className={`badge ${session.is_active ? 'badge-approved' : 'badge-pending'}`} style={{ borderRadius: '4px', letterSpacing: '1px' }}>
                    {session.is_active ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                  </span>
                </div>
                
                <div style={{ minHeight: '4.5rem' }}>
                  <h3 style={{ marginBottom: 4, fontSize: '1.1rem', color: 'var(--c-text)' }}>{session.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{session.description || 'Không có mô tả cho buổi ăn này.'}</p>
                </div>

                <div style={{ 
                  background: 'var(--c-bg)', 
                  padding: 'var(--sp-4)', 
                  borderRadius: 'var(--r-lg)', 
                  fontSize: '0.85rem',
                  border: '1px solid var(--c-border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Banknote size={14} /> Trợ cấp
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--c-primary-dark)' }}>{(session?.company_subsidy || 0).toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> Thời gian
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--c-text)' }}>{session.start_time} — {session.end_time}</span>
                  </div>
                </div>

                <div className="jp-divider" style={{ opacity: 0.2, margin: '8px 0' }} />

                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <Link 
                    to={`/admin/sessions/${session.id}/menu`} 
                    className="btn btn-primary" 
                    style={{ flex: 1, height: 36, fontSize: '0.75rem', borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, var(--c-text) 0%, #444 100%)', boxShadow: 'none' }}
                  >
                    <MenuIcon size={14} /> THỰC ĐƠN
                  </Link>
                  <button 
                    className="btn-icon" 
                    style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)', borderRadius: 'var(--r-md)' }}
                    onClick={() => { setEditingSession(session); setShowModal(true); }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-icon" 
                    style={{ background: session.is_active ? 'var(--c-danger-bg)' : 'var(--c-success-bg)', color: session.is_active ? 'var(--c-danger)' : 'var(--c-success)', borderRadius: 'var(--r-md)' }}
                    onClick={() => {
                      if (session.is_active) {
                        setConfirmModal({ id: session.id, type: 'close', name: session.name });
                      } else {
                        executeToggleActive(session.id, false);
                      }
                    }}
                    title={session.is_active ? 'Đóng buổi ăn' : 'Mở buổi ăn'}
                  >
                    <Power size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSave} style={{ borderRadius: 'var(--r-2xl)', maxWidth: 500 }}>
            <div className="modal-header" style={{ padding: '24px 32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingSession?.id ? '💮 Cập nhật buổi ăn' : '💮 Thêm buổi ăn mới'}
              </h3>
              <button type="button" className="btn-icon" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TÊN BUỔI ĂN (VÍ DỤ: CƠM TRƯA THỨ 2)</label>
                <input className="input" placeholder="Nhập tên..." value={editingSession?.name} onChange={e => setEditingSession({ ...editingSession!, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>MÔ TẢ NGẮN</label>
                <textarea className="input" rows={2} placeholder="Thông tin thêm..." value={editingSession?.description} onChange={e => setEditingSession({ ...editingSession!, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TRỢ CẤP (VNĐ)</label>
                  <input className="input" type="number" value={editingSession?.company_subsidy} onChange={e => setEditingSession({ ...editingSession!, company_subsidy: parseInt(e.target.value) })} required />
                </div>
                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TRẠNG THÁI</label>
                  <select className="input" value={editingSession?.is_active ? 'true' : 'false'} onChange={e => setEditingSession({ ...editingSession!, is_active: e.target.value === 'true' })}>
                    <option value="true">Đang mở (Active)</option>
                    <option value="false">Đóng (Closed)</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>GIỜ BẮT ĐẦU</label>
                  <input className="input" type="time" value={editingSession?.start_time} onChange={e => setEditingSession({ ...editingSession!, start_time: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)' }}>GIỜ KẾT THÚC</label>
                  <input className="input" type="time" value={editingSession?.end_time} onChange={e => setEditingSession({ ...editingSession!, end_time: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '24px 32px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 32px' }}>Xác nhận Lưu 🌸</button>
            </div>
          </form>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal animate-slideup" style={{ maxWidth: 400, borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
            <div style={{ 
              padding: '40px 32px 32px', 
              textAlign: 'center',
              background: 'linear-gradient(180deg, var(--c-primary-soft) 0%, #fff 100%)'
            }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: '50%', 
                background: 'var(--c-warning-bg)',
                color: 'var(--c-warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
              }}>
                <Power size={32} />
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 12, color: 'var(--c-text)' }}>
                Đóng buổi ăn?
              </h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                Buổi ăn <strong>{confirmModal.name}</strong> sẽ được tạm đóng và nhân viên không thể đặt món nữa.
              </p>
            </div>
            
            <div style={{ 
              padding: '0 32px 32px', 
              display: 'flex', 
              gap: 12,
              background: '#fff'
            }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1, height: 48, borderRadius: 'var(--r-lg)' }}
                onClick={() => setConfirmModal(null)}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, height: 48, borderRadius: 'var(--r-lg)', fontWeight: 800 }}
                onClick={() => executeToggleActive(confirmModal.id, true)}
              >
                Đồng ý Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

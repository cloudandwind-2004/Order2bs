import { useEffect, useState } from 'react';
import { selfCookApi } from '@/api';
import { SelfCookLog } from '@/types';
import { CreditCard, User, Calendar, CheckCircle, List, Send, X, TrendingUp, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface GroupedSubsidy {
  user_id: string;
  full_name: string;
  phone: string;
  payment_qr_url: string;
  total_amount: number;
  log_count: number;
}

export default function SelfCookPage() {
  const [logs, setLogs] = useState<SelfCookLog[]>([]);
  const [grouped, setGrouped] = useState<GroupedSubsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [logsRes, summaryRes] = await Promise.all([
        selfCookApi.listAdmin(),
        selfCookApi.summaryAdmin()
      ]);
      setLogs(logsRes.data || []);
      setGrouped(summaryRes.data || []);
    } catch {
      toast.error('Không thể tải danh sách trợ cấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPayment = async (userId: string) => {
    setConfirming(userId);
    try {
      await selfCookApi.confirmPayment(userId);
      toast.success('Đã xác nhận hoàn tiền thành công! 🌸');
      fetchData();
    } catch {
      toast.error('Lỗi khi xác nhận thanh toán');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const totalSubsidy = (grouped || []).reduce((sum, item) => sum + (item.total_amount || 0), 0);

  const getInitials = (name: string) => {
    return name.split(' ').pop()?.charAt(0).toUpperCase() || '🌸';
  };

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 自炊手当 · 返金
            </div>
            <h1 className="page-title">💰 Quản lý Trợ cấp Hoàn lại</h1>
            <p className="page-subtitle">Quản lý danh sách nhân viên tự nấu ăn/ăn ngoài cần được Admin hoàn tiền trợ cấp.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
             <TrendingUp size={32} color="var(--c-success)" style={{ opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-success), var(--c-accent-light), transparent)' }} />
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-6)', marginBottom: 'var(--sp-10)', alignItems: 'center' }}>
        <div className="card" style={{ flex: 1, border: 'none', background: 'linear-gradient(135deg, #fff 0%, var(--c-success-bg) 100%)', boxShadow: '0 8px 30px rgba(91, 155, 107, 0.08)', borderRadius: 'var(--r-2xl)' }}>
           <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 32px' }}>
              <div style={{ 
                width: 64, height: 64, background: 'var(--c-success)', color: '#fff',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(91, 155, 107, 0.3)'
              }}>
                <CreditCard size={32} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng ngân sách cần hoàn</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--c-success)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                   {totalSubsidy.toLocaleString()}đ
                </div>
              </div>
           </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ 
            height: 80, padding: '0 40px', fontSize: '1.25rem', gap: 16, borderRadius: 'var(--r-2xl)',
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%)',
            boxShadow: '0 10px 25px rgba(201, 116, 143, 0.25)' 
          }}
          onClick={() => setShowModal(true)}
        >
          <Send size={24} strokeWidth={2.5} /> 🌸 Thanh toán ngay
        </button>
      </div>

      <div className="card" style={{ border: 'none', borderRadius: 'var(--r-xl)' }}>
        <div className="card-header" style={{ padding: '20px 24px', fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <List size={18} color="var(--c-primary)" /> Liệt kê chi tiết trợ cấp ({logs.length})
          </div>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
           <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th style={{ background: 'transparent', paddingLeft: 24 }}>NHÂN VIÊN</th>
                <th style={{ background: 'transparent' }}>BUỔI ĂN ĐĂNG KÝ</th>
                <th style={{ background: 'transparent' }}>NGÀY ĐĂNG KÝ</th>
                <th style={{ background: 'transparent', paddingRight: 24 }}>SỐ TIỀN HOÀN</th>
              </tr>
            </thead>
            <tbody style={{ background: 'transparent' }}>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: 'var(--r-xl)' }}>
                    🍃 Chưa có yêu cầu hoàn tiền trợ cấp mới.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ boxShadow: '0 2px 8px rgba(44, 26, 36, 0.04)' }}>
                    <td style={{ borderTopLeftRadius: 'var(--r-lg)', borderBottomLeftRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: 'var(--r-md)', 
                          background: 'var(--c-primary-soft)', color: 'var(--c-primary-dark)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 800, fontSize: '0.85rem'
                        }}>
                          {getInitials(log.user?.full_name || '')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--c-text)' }}>{log.user?.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>{log.user?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', background: '#fff', fontSize: '0.88rem' }}>{log.session?.name}</td>
                    <td style={{ padding: '16px', background: '#fff', fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>{new Date(log.created_at).toLocaleDateString('vi-VN')}</td>
                    <td style={{ borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff', fontWeight: 900, color: 'var(--c-success)', fontSize: '1.05rem' }}>
                      +{log.credit_amount.toLocaleString()}đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal animate-fadein" style={{ maxWidth: 880, width: '95%', borderRadius: 'var(--r-2xl)' }}>
            <div className="modal-header" style={{ padding: '24px 32px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                 💳 Thanh toán trợ cấp định kỳ 💮
              </h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '32px' }}>
              {grouped.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                   <p style={{ color: 'var(--c-text-muted)' }}>Không có khoản nào cần thanh toán tập trung.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--c-text-muted)', letterSpacing: '1px' }}>
                        <th style={{ paddingLeft: 12 }}>NHÂN VIÊN</th>
                        <th>TỔNG HOÀN TRẢ</th>
                        <th style={{ textAlign: 'center' }}>QUÉT QR NHẬN TIỀN</th>
                        <th style={{ textAlign: 'right', paddingRight: 12 }}>XÁC NHẬN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map(item => (
                        <tr key={item.user_id} style={{ background: '#FDF8F5', borderRadius: 'var(--r-lg)' }}>
                          <td style={{ padding: '16px 20px', borderTopLeftRadius: 'var(--r-lg)', borderBottomLeftRadius: 'var(--r-lg)' }}>
                            <div style={{ fontWeight: 800, color: '#2C1A24' }}>{item.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8A6070' }}>Đã đăng ký {item.log_count} buổi ăn ngoài</div>
                          </td>
                          <td style={{ padding: '16px', fontWeight: 900, color: 'var(--c-success)', fontSize: '1.2rem' }}>
                            {item.total_amount.toLocaleString()}đ
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {item.payment_qr_url ? (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img 
                                  src={item.payment_qr_url} 
                                  alt="QR" 
                                  style={{ width: 80, height: 80, objectFit: 'contain', cursor: 'pointer', border: '2px solid #fff', borderRadius: 'var(--r-md)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                                  onClick={() => window.open(item.payment_qr_url, '_blank')}
                                />
                                <div style={{ fontSize: '0.6rem', color: 'var(--c-primary)', fontWeight: 700, marginTop: 4 }}>BẤM ĐỂ MỞ TO</div>
                              </div>
                            ) : (
                              <div style={{ 
                                color: 'var(--c-danger)', fontSize: '0.75rem', padding: '8px 12px', 
                                background: 'white', borderRadius: 'var(--r-md)', border: '1px dashed rgba(192, 68, 79, 0.4)',
                                display: 'flex', gap: 6, alignItems: 'center'
                              }}>
                                <Info size={12} /> NV chưa cài QR
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)' }}>
                            <button 
                              className="btn btn-primary"
                              disabled={confirming === item.user_id}
                              onClick={() => handleConfirmPayment(item.user_id)}
                              style={{ padding: '8px 24px', fontSize: '0.8rem', borderRadius: 'var(--r-md)', boxShadow: 'none' }}
                            >
                              {confirming === item.user_id ? '...' : (
                                <><CheckCircle size={14} style={{marginRight: 6}}/> ĐÃ TRẢ</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: '24px 32px', background: 'var(--c-bg-alt)' }}>
               <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { debtApi, paymentApi } from '@/api';
import { Debt, PaymentLog } from '@/types';
import { 
  CheckCircle, Clock, Search, Filter, 
  CreditCard, User as UserIcon, Calendar, Banknote, History, Wallet, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DebtManagerPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'debts'>('payments');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, debtRes] = await Promise.all([
        paymentApi.listAdmin(),
        debtApi.listAdmin()
      ]);
      setPayments(payRes.data);
      setDebts(debtRes.data);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPayment = async (id: string) => {
    if (!confirm('Xác nhận đã nhận được tiền chuyển khoản này?')) return;
    try {
      await paymentApi.confirm(id);
      toast.success('Đã xác nhận thanh toán thành công! 🌸');
      fetchData();
    } catch {
      toast.error('Lỗi khi xác nhận thanh toán');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.note?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDebts = debts.filter(d => 
    d.user?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.order?.session?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').pop()?.charAt(0).toUpperCase() || '🌸';
  };

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 債務管理 · 決済
            </div>
            <h1 className="page-title">💰 Quản lý Công nợ</h1>
            <p className="page-subtitle">Duyệt thanh toán và theo dõi công nợ nhân viên một cách chính xác.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
             <div style={{ 
               background: '#fff', padding: '10px 16px', borderRadius: 'var(--r-lg)', 
               boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12,
               border: '1px solid var(--c-border-light)'
             }}>
                <Search size={18} color="var(--c-text-muted)" />
                <input 
                  type="text"
                  placeholder="Tìm nhân viên..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: 200 }}
                />
             </div>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'rgba(201, 116, 143, 0.05)', padding: '6px', borderRadius: 'var(--r-xl)', width: 'fit-content', marginBottom: 'var(--sp-8)', border: '1px solid rgba(201, 116, 143, 0.1)' }}>
        <button 
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('payments')}
          style={{ 
            borderRadius: 'var(--r-lg)', padding: '10px 24px', fontSize: '0.82rem', fontWeight: 800,
            background: activeTab === 'payments' ? 'var(--c-primary)' : 'transparent',
            color: activeTab === 'payments' ? '#fff' : 'var(--c-text-muted)',
            boxShadow: activeTab === 'payments' ? '0 4px 12px rgba(201, 116, 143, 0.3)' : 'none'
          }}
        >
          <CreditCard size={14} style={{marginRight: 8}}/> DUYỆT THANH TOÁN ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={`btn ${activeTab === 'debts' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('debts')}
          style={{ 
            borderRadius: 'var(--r-lg)', padding: '10px 24px', fontSize: '0.82rem', fontWeight: 800,
            background: activeTab === 'debts' ? 'var(--c-primary)' : 'transparent',
            color: activeTab === 'debts' ? '#fff' : 'var(--c-text-muted)',
            boxShadow: activeTab === 'debts' ? '0 4px 12px rgba(201, 116, 143, 0.3)' : 'none'
          }}
        >
          <Wallet size={14} style={{marginRight: 8}}/> DANH SÁCH NỢ ({debts.length})
        </button>
      </div>

      <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
        <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
          {loading ? (
            <div className="loading-overlay" style={{ minHeight: 400 }}><div className="spinner" /></div>
          ) : activeTab === 'payments' ? (
            /* Payments Table */
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ background: 'transparent', paddingLeft: 24 }}>NHÂN VIÊN</th>
                  <th style={{ background: 'transparent' }}>SỐ TIỀN</th>
                  <th style={{ background: 'transparent' }}>THỜI GIAN</th>
                  <th style={{ background: 'transparent' }}>GHI CHÚ</th>
                  <th style={{ background: 'transparent' }}>TRẠNG THÁI</th>
                  <th style={{ background: 'transparent', textAlign: 'right', paddingRight: 24 }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody style={{ background: 'transparent' }}>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: 'var(--r-xl)' }}>Hiện không có yêu cầu thanh toán nào. 🍃</td></tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.id} className="animate-fadein">
                      <td style={{ borderTopLeftRadius: 'var(--r-lg)', borderBottomLeftRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff', border: '1px solid var(--c-border-light)', borderRight: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 36, height: 36, borderRadius: 'var(--r-md)', 
                            background: 'var(--c-primary-soft)', color: 'var(--c-primary-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 800, fontSize: '0.85rem'
                          }}>
                            {getInitials(p.user?.full_name || '')}
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--c-text)' }}>{p.user?.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', color: 'var(--c-primary-dark)', fontWeight: 900, fontSize: '1rem' }}>{p.amount.toLocaleString()}đ</td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>{new Date(p.created_at).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--c-text-light)' }}>{p.note || '—'}</td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)' }}>
                        {p.status === 'pending' ? (
                          <span className="badge badge-pending">CHỜ DUYỆT</span>
                        ) : (
                          <span className="badge badge-approved">HOÀN TẤT</span>
                        )}
                      </td>
                      <td style={{ borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff', border: '1px solid var(--c-border-light)', borderLeft: 'none', textAlign: 'right' }}>
                        {p.status === 'pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleConfirmPayment(p.id)} style={{ padding: '6px 16px', borderRadius: 'var(--r-md)' }}>
                            <Check size={14} style={{marginRight: 6}} strokeWidth={3} /> Xác nhận
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Debts Table */
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ background: 'transparent', paddingLeft: 24 }}>NHÂN VIÊN</th>
                  <th style={{ background: 'transparent' }}>PHÂN LOẠI BUỔI ĂN</th>
                  <th style={{ background: 'transparent' }}>MÓN ĐÃ ĐẶT</th>
                  <th style={{ background: 'transparent' }}>SỐ TIỀN NỢ</th>
                  <th style={{ background: 'transparent', paddingRight: 24 }}>NGÀY PHÁT SINH</th>
                </tr>
              </thead>
              <tbody style={{ background: 'transparent' }}>
                {filteredDebts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: 'var(--r-xl)' }}>Danh sách trắng, không có nợ đọng. 🌸</td></tr>
                ) : (
                  filteredDebts.map(d => (
                    <tr key={d.id} className="animate-fadein">
                      <td style={{ borderTopLeftRadius: 'var(--r-lg)', borderBottomLeftRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff', border: '1px solid var(--c-border-light)', borderRight: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 36, height: 36, borderRadius: 'var(--r-md)', 
                            background: 'var(--c-accent-light)', color: 'var(--c-accent-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 800, fontSize: '0.85rem'
                          }}>
                            {getInitials(d.user?.full_name || '')}
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--c-text)' }}>{d.user?.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-primary)' }}>{d.order?.session?.name}</td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', fontSize: '0.85rem' }}>{d.order?.is_self_cook ? '🍳 Tự nấu' : d.order?.menu_item?.name}</td>
                      <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', color: 'var(--c-danger)', fontWeight: 900, fontSize: '1.1rem' }}>{d.amount.toLocaleString()}đ</td>
                      <td style={{ borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)', padding: '16px 24px', background: '#fff', border: '1px solid var(--c-border-light)', borderLeft: 'none', fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div style={{ 
        marginTop: 'var(--sp-8)', 
        padding: '24px', 
        background: 'linear-gradient(135deg, white 0%, var(--c-bg-alt) 100%)', 
        borderRadius: 'var(--r-xl)', 
        border: '1px solid var(--c-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }}>
         <div style={{ width: 60, height: 60, background: 'var(--c-primary-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💮</div>
         <div>
            <div style={{ fontWeight: 900, color: 'var(--c-text)', fontSize: '1rem' }}>Thông tin đối soát</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', marginTop: 4 }}>
               Kết quả duyệt thanh toán sẽ ngay lập tức trừ vào tổng nợ của nhân viên. Hãy kiểm tra kỹ thông báo chuyển khoản ngân hàng trước khi bấm nút Xác nhận.
            </p>
         </div>
      </div>
    </div>
  );
}

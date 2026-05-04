import { useEffect, useState } from 'react';
import { debtApi, settingsApi, paymentApi } from '@/api';
import { Debt, BankQR } from '@/types';
import toast from 'react-hot-toast';
import { Wallet, History, Info, CheckCircle2, AlertCircle, X, CreditCard, ExternalLink, Calendar } from 'lucide-react';

export default function MyDebtPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankQR, setBankQR] = useState<BankQR | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      debtApi.myDebts(),
      settingsApi.getBankQR()
    ]).then(([debtRes, qrRes]) => {
      setDebts(debtRes.data);
      setBankQR(qrRes.data);
    }).catch(() => {
      // QR might not exist yet
    }).finally(() => setLoading(false));
  }, []);

  const totalUnpaid = debts
    .filter(d => !d.is_paid)
    .reduce((sum, d) => sum + d.amount, 0);

  const handlePay = async () => {
    if (totalUnpaid === 0) return;
    setSubmitting(true);
    try {
      await paymentApi.create({
        amount: totalUnpaid,
        note: paymentNote || 'Thanh toán nợ cơm trưa'
      });
      toast.success('Đã gửi yêu cầu xác nhận thanh toán! 🌸');
      setShowPayment(false);
      setPaymentNote('');
    } catch {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌸</div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );

  return (
    <div className="animate-fadein">
      {/* Redesigned Japanese Header */}
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 債務 · お支払い
            </div>
            <h1 className="page-title">💳 Công nợ & Thanh toán</h1>
            <p className="page-subtitle">Theo dõi công nợ và tất toán nhanh chóng qua QR CODE.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
             <Wallet size={32} color="var(--c-primary)" style={{ opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-10)' }}>
        {/* Debt Summary & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%)', 
            border: 'none', color: '#fff', boxShadow: '0 12px 30px rgba(201, 116, 143, 0.25)',
            borderRadius: 'var(--r-2xl)', overflow: 'hidden'
          }}>
            <div className="card-body" style={{ padding: '40px 32px', textAlign: 'center' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ padding: 12, background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }}>
                     <CreditCard size={32} />
                  </div>
               </div>
               <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, marginBottom: 8, letterSpacing: '1px' }}>TỔNG CÔNG NỢ HIỆN TẠI</div>
               <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 32, fontFamily: 'var(--font-display)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 {totalUnpaid.toLocaleString()}đ
               </div>
               <button 
                 className="btn btn-accent btn-lg w-full"
                 onClick={() => setShowPayment(true)}
                 disabled={totalUnpaid === 0}
                 style={{ 
                   fontWeight: 900, height: 60, fontSize: '1.1rem', borderRadius: 'var(--r-xl)',
                   background: '#fff', color: 'var(--c-primary)', border: 'none',
                   boxShadow: '0 8px 15px rgba(0,0,0,0.1)', transform: 'translateY(0)',
                   transition: 'all 0.2s'
                 }}
               >
                 💮 THANH TOÁN NGAY
               </button>
            </div>
          </div>

          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-xl)', background: 'transparent', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0 var(--sp-4) 0', fontWeight: 900, fontSize: '1rem' }}>
              <History size={20} color="var(--c-primary)" /> LỊCH SỬ NỢ PHÁT SINH
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {debts.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: 'var(--r-2xl)', border: '1.5px dashed var(--c-border)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>💮</div>
                  <p style={{ fontWeight: 800 }}>Tuyệt vời! Bạn không có nợ.</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>おめでとうございます</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                   {debts.map((debt, idx) => (
                     <div key={debt.id} className="animate-fadein" style={{ 
                       background: '#fff', padding: '16px 24px', borderRadius: 'var(--r-lg)',
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       border: `1px solid ${debt.is_paid ? 'var(--c-border-light)' : 'rgba(201, 116, 143, 0.2)'}`,
                       animationDelay: `${idx * 0.05}s`
                     }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                           <div style={{ color: 'var(--c-text-muted)' }}><Calendar size={18} /></div>
                           <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{new Date(debt.created_at).toLocaleDateString('vi-VN')}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>{debt.order?.session?.name || 'Đơn hàng'}</div>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontWeight: 900, fontSize: '1.1rem', color: debt.is_paid ? 'var(--c-text-light)' : 'var(--c-danger)' }}>
                              {debt.amount.toLocaleString()}đ
                           </div>
                           <div style={{ fontSize: '0.7rem', fontWeight: 800, color: debt.is_paid ? 'var(--c-success)' : 'var(--c-warning)', textTransform: 'uppercase' }}>
                              {debt.is_paid ? '✓ Đã tất toán' : '○ Đang nợ'}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Column & Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-2xl)' }}>
            <div className="card-header" style={{ background: 'var(--c-bg-alt)', color: 'var(--c-text)', fontWeight: 800, padding: 20 }}>
               🧧 HƯỚNG DẪN THANH TOÁN
            </div>
            <div className="card-body" style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              {[
                { step: '01', text: 'Nhấn "Thanh toán ngay" để lấy mã QR và thông tin tài khoản Admin.' },
                { step: '02', text: 'Thực hiện chuyển khoản chính xác số tiền cần trả qua ứng dụng ngân hàng.' },
                { step: '03', text: 'Gửi yêu cầu xác nhận. Admin sẽ đối soát và gạch nợ cho bạn trong vòng 24h.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ 
                    fontSize: '1.2rem', fontWeight: 900, color: 'var(--c-primary-soft)', 
                    fontFamily: 'serif', fontStyle: 'italic', position: 'relative' 
                  }}>
                    {item.step}
                    <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', height: 2, background: 'var(--c-primary-light)', opacity: 0.3 }} />
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--c-text)', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '24px', background: 'var(--c-primary-soft)', borderRadius: 'var(--r-xl)', border: '1px dashed var(--c-primary-light)', display: 'flex', gap: 16 }}>
             <Info size={24} color="var(--c-primary)" style={{ flexShrink: 0, marginTop: 4 }} />
             <div>
                <div style={{ fontWeight: 800, color: 'var(--c-primary-dark)', fontSize: '0.95rem', marginBottom: 4 }}>Chính sách thanh toán</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                   Mọi giao dịch sẽ được ghi lại trong nhật ký hệ thống. Vui lòng đảm bảo ghi nội dung chuyển khoản rõ ràng để Admin dễ dàng nhận diện.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay">
          <div className="modal animate-fadein" style={{ maxWidth: 500, borderRadius: 'var(--r-2xl)' }}>
            <div className="modal-header" style={{ padding: '24px 32px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                 🌸 Thanh toán Đơn hàng
              </h3>
              <button className="btn-icon" onClick={() => setShowPayment(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--c-text-muted)' }}>
                 Vui lòng chuyển khoản chính xác <br/>
                 <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--c-text)' }}>{totalUnpaid.toLocaleString()}đ</span>
              </p>
              
              {bankQR ? (
                <div style={{ 
                  padding: '24px', background: '#fff', borderRadius: 'var(--r-xl)', 
                  border: '2px solid var(--c-primary-soft)', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--c-primary)', color: 'white', fontSize: '0.65rem', padding: '4px 12px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>
                     VIETQR SCAN
                  </div>
                  <img 
                    src={bankQR.qr_image_url} 
                    alt="Bank QR" 
                    style={{ width: '100%', maxWidth: 280, margin: '0 auto', display: 'block' }} 
                  />
                  <div className="jp-divider" style={{ margin: '16px auto', width: '80%', opacity: 0.2 }} />
                  <div style={{ color: 'var(--c-text)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>{bankQR.bank_name.toUpperCase()}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1px' }}>{bankQR.account_no}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{bankQR.account_name.toUpperCase()}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', background: 'var(--c-bg-alt)', borderRadius: 'var(--r-xl)', border: '1px dashed var(--c-border)' }}>
                  <AlertCircle size={40} color="var(--c-warning)" style={{ opacity: 0.5, marginBottom: 12 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>Admin chưa cấu hình mã QR nhận tiền. <br/>Vui lòng thanh toán tiền mặt.</p>
                </div>
              )}

              <div className="input-group" style={{ textAlign: 'left' }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>NỘI DUNG CHUYỂN KHOẢN (GỢI Ý)</label>
                <input 
                  className="input" 
                  placeholder="Tra no com trua..." 
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  style={{ background: 'var(--c-bg-alt)', border: 'none' }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '24px 32px' }}>
              <button className="btn btn-ghost" onClick={() => setShowPayment(false)}>Đóng</button>
              <button 
                className="btn btn-primary" 
                onClick={handlePay} 
                disabled={submitting || (totalUnpaid === 0)}
                style={{ padding: '10px 32px' }}
              >
                {submitting ? '...' : '🌸 ĐÃ CHUYỂN KHOẢN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

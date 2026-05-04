import { useEffect, useState } from 'react';
import { settingsApi } from '@/api';
import { BankQR } from '@/types';
import { Save, QrCode, Building2, User as UserIcon, Hash, ExternalLink, Info, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_BANKS = [
  { id: 'vcb', name: 'Vietcombank' },
  { id: 'tcb', name: 'Techcombank' },
  { id: 'vpb', name: 'VPBank' },
  { id: 'mb', name: 'MBBank' },
  { id: 'acb', name: 'ACB' },
  { id: 'bidv', name: 'BIDV' },
  { id: 'ctg', name: 'VietinBank' },
  { id: 'tpb', name: 'TPBank' },
];

export default function QRSettingsPage() {
  const [qr, setQr] = useState<Partial<BankQR>>({
    bank_name: 'tcb',
    account_no: '',
    account_name: '',
    qr_image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    settingsApi.getBankQR()
      .then(res => setQr(res.data))
      .catch(() => {
        // No QR set yet
      })
      .finally(() => setLoading(false));
  }, []);

  const generateVietQR = (bank: string, account: string, name: string) => {
    if (!bank || !account) return '';
    return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?accountName=${encodeURIComponent(name)}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const qr_image_url = generateVietQR(qr.bank_name!, qr.account_no!, qr.account_name!);
    const dataToSave = { ...qr, qr_image_url };

    try {
      await settingsApi.saveBankQR(dataToSave);
      toast.success('Đã cấu hình QR thanh toán hệ thống! 🌸');
      setQr(dataToSave);
    } catch {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 決済設定 · QR
            </div>
            <h1 className="page-title">📱 QR Thanh toán Hệ thống</h1>
            <p className="page-subtitle">Thiết lập tài khoản ngân hàng để nhân viên quét mã gạch nợ.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
             <QrCode size={32} color="var(--c-primary)" style={{ opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-2xl)' }}>
            <div className="card-header" style={{ background: 'var(--c-bg-alt)', color: 'var(--c-text)', fontWeight: 800 }}>
              🏦 Tài khoản thụ hưởng
            </div>
            <form className="card-body" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', padding: 'var(--sp-8)' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   NGÂN HÀNG
                </label>
                <select 
                  className="input" 
                  value={qr.bank_name} 
                  onChange={e => setQr({ ...qr, bank_name: e.target.value })}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                  required
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {COMMON_BANKS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   SỐ TÀI KHOẢN
                </label>
                <input 
                  className="input" 
                  placeholder="Nhập số tài khoản..." 
                  value={qr.account_no} 
                  onChange={e => setQr({ ...qr, account_no: e.target.value })}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                  required 
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   TÊN CHỦ TÀI KHOẢN
                </label>
                <input 
                  className="input" 
                  placeholder="Ví dụ: NGUYEN VAN A" 
                  value={qr.account_name} 
                  onChange={e => setQr({ ...qr, account_name: e.target.value.toUpperCase() })}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                  required 
                />
              </div>

              <div style={{ padding: 'var(--sp-4)', background: 'var(--c-info-bg)', color: 'var(--c-info)', borderRadius: 'var(--r-lg)', fontSize: '0.8rem', display: 'flex', gap: 10, border: '1px solid rgba(74, 127, 165, 0.1)' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Mã QR sẽ được sinh tự động qua VietQR API để nhân viên có thể thanh toán nhanh bằng ứng dụng ngân hàng.</span>
              </div>

              <button className="btn btn-primary btn-lg w-full" type="submit" disabled={submitting} style={{ height: 56, borderRadius: 'var(--r-lg)', marginTop: 8 }}>
                {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : <><Save size={18} style={{marginRight: 10}} /> Cập nhật cấu hình Hệ thống</>}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
            <div className="card-header" style={{ textAlign: 'center', fontWeight: 800 }}>XEM TRƯỚC HIỂN THỊ</div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-6)', padding: 'var(--sp-8)' }}>
              {(qr.bank_name && qr.account_no) ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ 
                    position: 'relative', padding: '24px', background: '#fff', 
                    border: '2px solid var(--c-border-light)', borderRadius: 'var(--r-xl)', 
                    boxShadow: 'var(--shadow-md)', display: 'inline-block' 
                  }}>
                    <img 
                      src={generateVietQR(qr.bank_name, qr.account_no, qr.account_name || '')} 
                      alt="QR Preview" 
                      style={{ width: '100%', maxWidth: 280, display: 'block' }}
                    />
                  </div>
                  <div style={{ marginTop: 'var(--sp-6)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 700, letterSpacing: '1px' }}>✿ TÀI KHOẢN ĐANG DÙNG ✿</div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', marginTop: 6, color: 'var(--c-text)' }}>
                      {qr.bank_name?.toUpperCase()} - {qr.account_no}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text-muted)' }}>{qr.account_name?.toUpperCase()}</div>
                  </div>

                  <div style={{ 
                    marginTop: 'var(--sp-8)', 
                    color: 'var(--c-success)', 
                    background: 'var(--c-success-bg)',
                    padding: '12px',
                    borderRadius: 'var(--r-lg)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 8, 
                    fontSize: '0.85rem'
                  }}>
                    <CheckCircle size={16} /> Cấu hình này đã sẵn sàng cho nhân viên
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ minHeight: 400 }}>
                  <QrCode size={80} style={{ opacity: 0.05, marginBottom: 16 }} />
                  <p>Vui lòng nhập đầy đủ thông tin<br/>để xem trước mã QR</p>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            background: 'var(--c-bg-alt)', 
            padding: '20px', 
            borderRadius: 'var(--r-xl)', 
            fontSize: '0.82rem', 
            color: 'var(--c-text-muted)',
            lineHeight: 1.6,
            border: '1px solid var(--c-border-light)'
          }}>
             <div style={{ fontWeight: 800, color: 'var(--c-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExternalLink size={16} /> Vị trí hiển thị
             </div>
             Mã QR này sẽ hiển thị tại trang <span style={{ color: 'var(--c-primary)', fontWeight: 700 }}>Công nợ của tôi</span> của nhân viên. Khi quét mã này, thông tin số tài khoản và tên chủ tài khoản sẽ tự động được điền trong ứng dụng ngân hàng của họ.
          </div>
        </div>
      </div>
    </div>
  );
}

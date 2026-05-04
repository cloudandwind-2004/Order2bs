import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { selfCookApi } from '@/api';
import { QrCode, Save, CheckCircle, Building2, User as UserIcon, Hash, RefreshCw, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuthStore();
  
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  
  const [qrUrl, setQrUrl] = useState(user?.payment_qr_url || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.payment_qr_url?.includes('vietqr.io')) {
      try {
        const url = new URL(user.payment_qr_url);
        const paths = url.pathname.split('/');
        const details = paths[paths.length - 1].replace('.jpg', '').split('-');
        if (details.length >= 2) {
          setBankName(details[0]);
          setAccountNo(details[1]);
          setAccountName(url.searchParams.get('accountName') || '');
        }
      } catch (e) {
        console.error("Failed to parse existing QR URL");
      }
    }
  }, [user]);

  const handleGenerateQR = () => {
    if (!bankName || !accountNo || !accountName) {
      toast.error('Vui lòng nhập đủ thông tin ngân hàng');
      return;
    }

    const encodedName = encodeURIComponent(accountName);
    const generatedUrl = `https://img.vietqr.io/image/${bankName}-${accountNo}-compact2.jpg?amount=0&addInfo=HOAN%20TIEN%20LUNCH&accountName=${encodedName}`;
    setQrUrl(generatedUrl);
    toast.success('Đã làm mới mã QR của bạn! 🌸');
  };

  const handleSave = async () => {
    if (!qrUrl) {
      toast.error('Vui lòng tạo mã QR trước khi lưu');
      return;
    }

    setIsSaving(true);
    try {
      await selfCookApi.updateQR(qrUrl);
      if (user) {
        updateUser({ ...user, payment_qr_url: qrUrl });
      }
      toast.success('Đã lưu mã QR thành công! 🌸');
    } catch {
      toast.error('Lỗi khi lưu mã QR');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fadein" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 設定 · QRコード
            </div>
            <h1 className="page-title">⚙️ Cài đặt nhận tiền</h1>
            <p className="page-subtitle">Cân đối và tạo mã QR để Admin hoàn tiền trợ cấp cho bạn.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
             <QrCode size={32} color="var(--c-primary)" style={{ opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 'var(--sp-8)' }}>
        {/* Bank Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-2xl)' }}>
            <div className="card-header" style={{ background: 'var(--c-bg-alt)', color: 'var(--c-text)', fontWeight: 800 }}>
              🏦 Thông tin ngân hàng
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', padding: 'var(--sp-8)' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   TÊN NGÂN HÀNG
                </label>
                <select 
                  className="input" 
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  <option value="MB">MB Bank (Ngân hàng Quân Đội)</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="ICB">VietinBank</option>
                  <option value="ACB">ACB (Ngân hàng Á Châu)</option>
                  <option value="TCB">Techcombank</option>
                  <option value="STB">Sacombank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VIB">VIB</option>
                  <option value="TPB">TPBank</option>
                  <option value="VPB">VPBank</option>
                  <option value="MSB">MSB (Ngân hàng Hàng Hải)</option>
                </select>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   SỐ TÀI KHOẢN
                </label>
                <input 
                  className="input" 
                  placeholder="Nhập số tài khoản..." 
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>
                   TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU)
                </label>
                <input 
                  className="input" 
                  placeholder="VD: NGUYEN VAN A" 
                  value={accountName}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  style={{ borderRadius: 'var(--r-lg)', background: 'var(--c-bg)' }}
                />
              </div>

              <button 
                className="btn btn-outline w-full" 
                onClick={handleGenerateQR}
                style={{ height: 48, borderRadius: 'var(--r-lg)', marginTop: 8 }}
              >
                <RefreshCw size={18} style={{ marginRight: 8 }} />
                Tạo mã QR VietQR mẫu
              </button>
            </div>
          </div>

          <div style={{ padding: 'var(--sp-4)', background: 'var(--c-primary-soft)', borderRadius: 'var(--r-lg)', border: '1px dashed var(--c-primary-light)', display: 'flex', gap: 12 }}>
             <Info size={18} color="var(--c-primary)" style={{ flexShrink: 0 }} />
             <p style={{ fontSize: '0.8rem', color: 'var(--c-primary-dark)', lineHeight: 1.5 }}>
                Thông tin này dùng để tạo link thanh toán nhanh giúp Admin hoàn trả tiền mặt hoặc trợ cấp tích lũy vào tài khoản của bạn.
             </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="card" style={{ border: 'none', borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
            <div className="card-header" style={{ textAlign: 'center', fontWeight: 800 }}>MÃ QR CỦA BẠN</div>
            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '1/1', 
                background: 'white', 
                borderRadius: 'var(--r-xl)',
                border: '2px solid var(--c-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: 'var(--sp-6)',
                position: 'relative'
              }}>
                {qrUrl ? (
                  <>
                    <img src={qrUrl} alt="Payment QR" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.6rem', background: 'var(--c-primary)', color: 'white', padding: '2px 8px', borderRadius: 4 }}>
                       Live Preview
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--c-text-muted)', textAlign: 'center' }}>
                    <QrCode size={80} style={{ opacity: 0.05, marginBottom: 16 }} />
                    <p style={{ fontSize: '0.85rem' }}>Dữ liệu chưa sẵn sàng<br/>Hãy nhập thông tin bên trái</p>
                  </div>
                )}
              </div>

              <button 
                className="btn btn-primary w-full btn-lg" 
                onClick={handleSave}
                disabled={isSaving || !qrUrl}
                style={{ height: 56, borderRadius: 'var(--r-lg)' }}
              >
                <Save size={18} style={{ marginRight: 10 }} />
                {isSaving ? 'Đang xử lý...' : 'Xác nhận Lưu mã QR'}
              </button>
              
              {user?.payment_qr_url && (
                 <div style={{ 
                   marginTop: 'var(--sp-5)', 
                   color: 'var(--c-success)', 
                   background: 'var(--c-success-bg)',
                   padding: '10px',
                   borderRadius: 'var(--r-md)',
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   gap: 8, 
                   fontSize: '0.85rem',
                   fontWeight: 700
                 }}>
                   <CheckCircle size={16} /> Thông tin đã được kích hoạt
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

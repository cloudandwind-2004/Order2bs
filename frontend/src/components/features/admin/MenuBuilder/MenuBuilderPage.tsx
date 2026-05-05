import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionApi, menuApi } from '@/api';
import { MealSession, MenuCategory, MenuItem } from '@/types';
import {
  Plus, Edit2, Trash2,
  ChevronLeft, X, Utensils, Zap, FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import ComboRulePanel from './ComboRulePanel';

type Tab = 'menu' | 'combo';

export default function MenuBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<MealSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('menu');

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<MenuCategory> | null>(null);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [activeCatID, setActiveCatID] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    sessionApi.getMenu(id)
      .then(res => setSession(res.data.session))
      .catch(() => toast.error('Lỗi khi tải thực đơn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  // Category Actions
  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editingCat) return;
    try {
      if (editingCat.id) {
        await menuApi.updateCategory(editingCat.id, editingCat);
        toast.success('Đã cập nhật danh mục 🌸');
      } else {
        await menuApi.createCategory(id, { name: editingCat.name!, display_order: editingCat.display_order });
        toast.success('Đã thêm danh mục mới 🌸');
      }
      setShowCatModal(false);
      fetchData();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm('Xóa danh mục sẽ xóa toàn bộ món ăn bên trong. Bạn chắc chắn?')) return;
    try {
      await menuApi.deleteCategory(catId);
      toast.success('Đã xóa danh mục');
      fetchData();
    } catch { toast.error('Lỗi khi xóa'); }
  };

  // Item Actions
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem.id) {
        await menuApi.updateItem(editingItem.id, editingItem);
        toast.success('Đã cập nhật món ăn 🌸');
      } else if (activeCatID) {
        await menuApi.createItem(activeCatID, { name: editingItem.name!, price: editingItem.price! });
        toast.success('Đã thêm món ăn mới 🌸');
      }
      setShowItemModal(false);
      fetchData();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Xóa món ăn này?')) return;
    try {
      await menuApi.deleteItem(itemId);
      toast.success('Đã xóa món ăn');
      fetchData();
    } catch { toast.error('Lỗi khi xóa'); }
  };

  const handleBulkImport = async () => {
    if (!id || !importText.trim()) return;
    setImporting(true);
    try {
      await menuApi.bulkImportMenu(id, importText);
      toast.success('Đã nhập thực đơn hàng loạt! 🌸');
      setShowImportModal(false);
      setImportText('');
      fetchData();
    } catch {
      toast.error('Lỗi khi nhập thực đơn');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!session) return <div className="empty-state">Không tìm thấy dữ liệu</div>;

  return (
    <div className="animate-fadein">
      {/* ── Page Header ── */}
      <div className="page-header">
        <Link to="/admin/sessions" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--c-primary)', textDecoration: 'none',
          fontSize: '0.85rem', fontWeight: 800, marginBottom: 12,
          padding: '4px 12px', background: 'var(--c-primary-soft)',
          borderRadius: 'var(--r-md)'
        }}>
          <ChevronLeft size={16} strokeWidth={3} /> QUAY LẠI
        </Link>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
            ✦ メニュー編集
          </div>
          <h1 className="page-title">🍱 Thực đơn: {session.name}</h1>
          <p className="page-subtitle">Quản lý thực đơn và cấu hình combo một cách khoa học.</p>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{
        display: 'flex',
        background: 'var(--c-bg-alt)',
        borderRadius: 'var(--r-xl)',
        padding: 6,
        gap: 6,
        marginBottom: 'var(--sp-6)',
        border: '1px solid var(--c-border-light)',
        width: 'fit-content',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 28px',
            borderRadius: 'var(--r-lg)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            background: activeTab === 'menu' ? '#fff' : 'transparent',
            color: activeTab === 'menu' ? 'var(--c-primary)' : 'var(--c-text-muted)',
            boxShadow: activeTab === 'menu' ? 'var(--shadow-card)' : 'none',
          }}
        >
          <Utensils size={18} />
          Thực đơn
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('combo')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 28px',
            borderRadius: 'var(--r-lg)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            background: activeTab === 'combo' ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'transparent',
            color: activeTab === 'combo' ? '#f0c040' : 'var(--c-text-muted)',
            boxShadow: activeTab === 'combo' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          <Zap size={18} color={activeTab === 'combo' ? '#f0c040' : undefined} />
          Cài đặt Combo
          {session.combo_rule?.is_active && (
            <span style={{
              background: 'var(--c-success)', color: '#fff',
              borderRadius: 'var(--r-full)', padding: '2px 8px',
              fontSize: '0.65rem', fontWeight: 900,
            }}>BẬT</span>
          )}
        </button>
      </div>

      {/* ── TAB: Thực đơn ── */}
      {activeTab === 'menu' && (
        <div className="animate-fadein">
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 'var(--sp-4)' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowImportModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--r-xl)' }}
            >
              <Zap size={18} fill="currentColor" /> NHẬP THỰC ĐƠN NHANH (BULK)
            </button>
          </div>

          {/* Category list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
            {!session.categories || session.categories.length === 0 ? (
              <div className="card" style={{ border: '2px dashed var(--c-border-light)', background: 'transparent' }}>
                <div className="card-body empty-state" style={{ padding: '80px' }}>
                  <Utensils size={48} color="var(--c-text-light)" />
                  <p style={{ marginTop: 12, fontWeight: 700 }}>Chưa có thực đơn nào.</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)', marginBottom: 20 }}>Sử dụng nút "Nhập nhanh" ở trên để tạo thực đơn hàng loạt bằng cách dán văn bản.</p>
                  <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>Bắt đầu ngay 🚀</button>
                </div>
              </div>
            ) : (
              session.categories.map((cat, idx) => (
                <div key={cat.id} className="card animate-fadein" style={{
                  border: 'none', borderRadius: 'var(--r-xl)',
                  animationDelay: `${idx * 0.05}s`, overflow: 'hidden'
                }}>
                  <div style={{ height: 5, background: 'linear-gradient(90deg, var(--c-primary), var(--c-primary-light))' }} />
                  <div className="card-header" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--c-bg-alt)', padding: '14px 24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div style={{ padding: '4px 12px', background: 'var(--c-primary)', color: 'white', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: '0.78rem' }}>
                        {cat.display_order}
                      </div>
                      <span style={{ fontWeight: 850, fontSize: '1.1rem' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 10px', background: '#fff', borderRadius: 'var(--r-full)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border-light)' }}>
                        {cat.items?.length || 0} món
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <button className="btn-icon" style={{ background: '#fff', border: '1px solid var(--c-border-light)' }} onClick={() => { setEditingCat(cat); setShowCatModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" style={{ background: '#fff', border: '1px solid var(--c-border-light)', color: 'var(--c-danger)' }} onClick={() => handleDeleteCat(cat.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {!cat.items || cat.items.length === 0 ? (
                      <div style={{ padding: '28px', textAlign: 'center', color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>
                        Danh mục này chưa có món ăn. Hãy dùng Nhập nhanh để thêm.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {cat.items.map(item => (
                            <tr key={item.id} style={{ borderTop: '1px solid var(--c-border-light)', background: '#fff' }}>
                              <td style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                  🍛
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '0.95rem' }}>{item.name}</div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 24px', color: 'var(--c-primary-dark)', fontWeight: 900, fontSize: '1.05rem', textAlign: 'right' }}>
                                {(item?.price || 0).toLocaleString()}đ
                              </td>
                              <td style={{ padding: '14px 24px', width: 100 }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button className="btn-icon" onClick={() => { setEditingItem(item); setShowItemModal(true); }}>
                                    <Edit2 size={15} />
                                  </button>
                                  <button className="btn-icon" onClick={() => handleDeleteItem(item.id)}>
                                    <Trash2 size={15} color="var(--c-danger)" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Combo ── */}
      {activeTab === 'combo' && id && (
        <div className="animate-fadein">
          <ComboRulePanel
            sessionId={id}
            sessionName={session.name}
            categories={session.categories || []}
            initialRule={session.combo_rule}
            onSaved={fetchData}
          />
        </div>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSaveCat} style={{ borderRadius: 'var(--r-2xl)', maxWidth: 460 }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <h3 style={{ margin: 0 }}>{editingCat?.id ? '💮 Sửa danh mục' : '💮 Thêm danh mục'}</h3>
              <button type="button" className="btn-icon" onClick={() => setShowCatModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TÊN DANH MỤC</label>
                <input className="input" placeholder="VD: 🥓 Món Chính, 🥦 Món Rau..." value={editingCat?.name || ''} onChange={e => setEditingCat({ ...editingCat!, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>THỨ TỰ HIỂN THỊ</label>
                <input className="input" type="number" value={editingCat?.display_order || 1} onChange={e => setEditingCat({ ...editingCat!, display_order: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '18px 28px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCatModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Item Modal ── */}
      {showItemModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSaveItem} style={{ borderRadius: 'var(--r-2xl)', maxWidth: 460 }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <h3 style={{ margin: 0 }}>{editingItem?.id ? '🍱 Sửa món ăn' : '🍱 Thêm món mới'}</h3>
              <button type="button" className="btn-icon" onClick={() => setShowItemModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TÊN MÓN ĂN</label>
                <input className="input" placeholder="Nhập tên món..." value={editingItem?.name || ''} onChange={e => setEditingItem({ ...editingItem!, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>ĐƠN GIÁ (VNĐ)</label>
                <input className="input" type="number" step={1000} value={editingItem?.price || 25000} onChange={e => setEditingItem({ ...editingItem!, price: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '18px 28px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowItemModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Lưu món ăn 🌸</button>
            </div>
          </form>
        </div>
      )}
      {/* ── Quick Import Modal ── */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ borderRadius: 'var(--r-2xl)', maxWidth: 600, width: '90%' }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileDown size={20} color="var(--c-primary)" /> Nhập thực đơn nhanh
              </h3>
              <button type="button" className="btn-icon" onClick={() => setShowImportModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '28px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', marginBottom: 16 }}>
                Dán danh sách món ăn vào đây. Hệ thống sẽ tự tách Nhóm và Món dựa trên dấu ":" hoặc Emoji.
                Sử dụng "={'>'} 20k" để đặt giá cho nhóm món bên dưới.
              </p>
              <textarea
                className="input"
                rows={12}
                placeholder={"Ví dụ:\n🥓 Món Chính:\nSườn Sốt Cay Ngọt\n=> 20k\n\n🥦 Món Rau:\nRau Cải Luộc\n=> 10k"}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
            <div className="modal-footer" style={{ padding: '18px 28px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowImportModal(false)}>Đóng</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBulkImport}
                disabled={importing || !importText.trim()}
                style={{ padding: '8px 32px' }}
              >
                {importing ? 'Đang xử lý...' : 'Bắt đầu nhập 🌸'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

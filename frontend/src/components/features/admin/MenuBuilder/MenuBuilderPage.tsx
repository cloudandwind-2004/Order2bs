import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionApi, menuApi } from '@/api';
import { MealSession, MenuCategory, MenuItem } from '@/types';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Tag, 
  ChevronDown, ChevronUp, MoreVertical, Package, ChevronLeft, X, Utensils, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import ComboRulePanel from './ComboRulePanel';

export default function MenuBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<MealSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComboPanel, setShowComboPanel] = useState(false);
  
  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<MenuCategory> | null>(null);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [activeCatID, setActiveCatID] = useState<string | null>(null);

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    sessionApi.getMenu(id)
      .then(res => setSession(res.data.session))
      .catch(() => toast.error('Lỗi khi tải thực đơn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
    if (!confirm('Xóa danh mục sẽ xóa toàn bộ món ăn bên trong. Bạn chắc sắc?')) return;
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

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!session) return <div className="empty-state">Không tìm thấy dữ liệu</div>;

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Link to="/admin/sessions" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 6, 
          color: 'var(--c-primary)', textDecoration: 'none', 
          fontSize: '0.85rem', fontWeight: 800, marginBottom: 12,
          padding: '4px 12px', background: 'var(--c-primary-soft)',
          borderRadius: 'var(--r-md)'
        }}>
          <ChevronLeft size={16} strokeWidth={3} /> QUAY LẠI
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ メニュー編集
            </div>
            <h1 className="page-title">🍱 Thực đơn: {session.name}</h1>
            <p className="page-subtitle">Sắp xếp các món ăn một cách khoa học và tinh tế.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setShowComboPanel(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '2px solid var(--c-border-light)',
                background: showComboPanel ? 'linear-gradient(135deg,#1a1a2e,#16213e)' : undefined,
                color: showComboPanel ? '#f0c040' : undefined,
              }}
            >
              <Zap size={16} color={showComboPanel ? '#f0c040' : undefined} />
              {showComboPanel ? 'Ẩn Combo' : 'Cài đặt Combo'}
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingCat({ name: '', display_order: (session.categories?.length || 0) + 1 }); setShowCatModal(true); }}>
              <Plus size={18} strokeWidth={2.5} /> Thêm danh mục
            </button>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {/* Combo Rule Panel */}
      {showComboPanel && id && (
        <div className="animate-fadein" style={{ marginBottom: 'var(--sp-4)' }}>
          <ComboRulePanel
            sessionId={id}
            sessionName={session.name}
            initialRule={session.combo_rule}
            onClose={() => setShowComboPanel(false)}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        {session.categories?.length === 0 ? (
          <div className="card" style={{ border: '2px dashed var(--c-border-light)', background: 'transparent' }}>
            <div className="card-body empty-state" style={{ padding: '60px' }}>
               <Utensils size={48} color="var(--c-text-light)" />
               <p style={{ marginTop: 12 }}>Chưa có danh mục nào. Hãy bắt đầu kiến tạo thực đơn ngay!</p>
            </div>
          </div>
        ) : (
          session.categories?.map((cat, idx) => (
            <div key={cat.id} className="card animate-fadein" style={{ 
              border: 'none', 
              borderRadius: 'var(--r-xl)',
              animationDelay: `${idx * 0.1}s`,
              overflow: 'hidden'
            }}>
              <div style={{ height: 6, background: 'linear-gradient(90deg, var(--c-primary), var(--c-primary-light))' }} />
              <div className="card-header" style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: 'var(--c-bg-alt)', padding: '16px 24px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <div style={{ 
                    padding: '6px 12px', background: 'var(--c-primary)', color: 'white', 
                    borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: '0.8rem' 
                  }}>
                    {cat.display_order}
                  </div>
                  <span style={{ fontWeight: 850, fontSize: '1.15rem', color: 'var(--c-text)' }}>{cat.name.toUpperCase()}</span>
                  <span style={{ 
                    fontSize: '0.7rem', padding: '2px 10px', background: '#fff', 
                    borderRadius: 'var(--r-full)', color: 'var(--c-text-muted)',
                    border: '1px solid var(--c-border-light)'
                  }}>
                    {cat.items?.length || 0} items
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setActiveCatID(cat.id); setEditingItem({ name: '', price: 35000 }); setShowItemModal(true); }}>
                    <Plus size={14} strokeWidth={3} /> THÊM MÓN
                  </button>
                  <button className="btn-icon" style={{ background: '#fff', border: '1px solid var(--c-border-light)' }} onClick={() => { setEditingCat(cat); setShowCatModal(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon" style={{ background: '#fff', border: '1px solid var(--c-border-light)', color: 'var(--c-danger)' }} onClick={() => handleDeleteCat(cat.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {cat.items?.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#fff', color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>
                    <p>Chưa có món ăn nào trong danh mục này.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {cat.items?.map(item => (
                        <tr key={item.id} style={{ borderTop: '1px solid var(--c-border-light)', transition: 'background 0.2s', background: '#fff' }}>
                          <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                            <div style={{ 
                              width: 40, height: 40, borderRadius: 'var(--r-md)', 
                              background: 'var(--c-bg)', display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', fontSize: '1.2rem'
                            }}>
                              🍛
                            </div>
                            <div>
                               <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '0.95rem' }}>{item.name}</div>
                               <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>ID: {item.id.substring(0,8)}</div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--c-primary-dark)', fontWeight: 900, fontSize: '1.1rem', textAlign: 'right' }}>
                            {(item?.price || 0).toLocaleString()}đ
                          </td>
                          <td style={{ padding: '16px 24px', width: 100 }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="btn-icon" onClick={() => { setEditingItem(item); setShowItemModal(true); }}>
                                <Edit2 size={16} />
                              </button>
                              <button className="btn-icon" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 size={16} color="var(--c-danger)" />
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

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSaveCat} style={{ borderRadius: 'var(--r-2xl)', maxWidth: 460 }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <h3 style={{ margin: 0 }}>{editingCat?.id ? '💮 Sửa danh mục' : '💮 Thêm danh mục'}</h3>
              <button type="button" className="btn-icon" onClick={() => setShowCatModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TÊN DANH MỤC</label>
                <input className="input" placeholder="Ví dụ: Món chính, Tráng miệng..." value={editingCat?.name} onChange={e => setEditingCat({ ...editingCat!, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>THỨ TỰ ƯU TIÊN</label>
                <input className="input" type="number" value={editingCat?.display_order} onChange={e => setEditingCat({ ...editingCat!, display_order: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '18px 28px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCatModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSaveItem} style={{ borderRadius: 'var(--r-2xl)', maxWidth: 460 }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <h3 style={{ margin: 0 }}>{editingItem?.id ? '🍱 Sửa món ăn' : '🍱 Thêm món mới'}</h3>
              <button type="button" className="btn-icon" onClick={() => setShowItemModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>TÊN MÓN ĂN</label>
                <input className="input" placeholder="Nhập tên món..." value={editingItem?.name} onChange={e => setEditingItem({ ...editingItem!, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)' }}>ĐƠN GIÁ (VNĐ)</label>
                <input className="input" type="number" step={1000} value={editingItem?.price} onChange={e => setEditingItem({ ...editingItem!, price: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '18px 28px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowItemModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Lưu món ăn 🌸</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

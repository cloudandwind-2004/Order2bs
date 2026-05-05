import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi, orderApi } from '@/api';
import { MealSession, MenuItem, ComboRule } from '@/types';
import toast from 'react-hot-toast';
import { Utensils, ChefHat, Check, Info, Zap, ShoppingCart, X, Plus, Minus } from 'lucide-react';

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<MealSession | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSelfCook, setIsSelfCook] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Multi-select cart: itemId -> { item, qty }
  const [cart, setCart] = useState<Record<string, { item: MenuItem; qty: number }>>({});
  const [comboRule, setComboRule] = useState<ComboRule | null>(null);

  useEffect(() => {
    if (!id) return;
    sessionApi.getMenu(id)
      .then(res => {
        const s = res.data.session;
        setSession(s);
        setIsLocked(res.data.is_locked);
        if (s.combo_rule?.is_active) setComboRule(s.combo_rule);
      })
      .catch(() => toast.error('Không thể tải menu'))
      .finally(() => setLoading(false));
  }, [id]);

  // Cart helpers
  const totalItems = useMemo(() => Object.values(cart).reduce((s, v) => s + v.qty, 0), [cart]);
  const cartList = useMemo(() => Object.values(cart).filter(v => v.qty > 0), [cart]);

  const addItem = (item: MenuItem) => {
    setIsSelfCook(false);
    setCart(prev => {
      const cur = prev[item.id];
      if (!comboRule) {
        // single-select mode: replace
        return { [item.id]: { item, qty: 1 } };
      }
      // multi-select: toggle or increment
      if (cur && cur.qty > 0) {
        // if already at max allowed (required_items), don't exceed
        if (totalItems >= comboRule.required_items && !cur) return prev;
        return { ...prev, [item.id]: { item, qty: cur.qty + 1 } };
      }
      return { ...prev, [item.id]: { item, qty: 1 } };
    });
  };

  const removeItem = (itemId: string) => {
    setCart(prev => {
      const cur = prev[itemId];
      if (!cur || cur.qty <= 0) return prev;
      if (cur.qty === 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...cur, qty: cur.qty - 1 } };
    });
  };

  const clearCart = () => setCart({});

  // Pricing
  const isComboComplete = useMemo(() => {
    if (!comboRule || !comboRule.is_active) return false;
    
    // If there are category-specific rules
    if (comboRule.category_rules && comboRule.category_rules !== '[]') {
      try {
        const rules: { category_id: string; count: number }[] = JSON.parse(comboRule.category_rules);
        
        // Count items per category in cart
        const catCounts: Record<string, number> = {};
        Object.values(cart).forEach(v => {
          const catId = v.item.category_id;
          catCounts[catId] = (catCounts[catId] || 0) + v.qty;
        });

        // Check if all rules met
        return rules.every(r => (catCounts[r.category_id] || 0) >= r.count);
      } catch {
        return totalItems >= comboRule.required_items;
      }
    }
    
    // Fallback to simple count
    return totalItems >= comboRule.required_items;
  }, [cart, comboRule, totalItems]);

  const subsidyAmount = session?.company_subsidy || 0;

  const totalPrice = useMemo(() => {
    if (isComboComplete && comboRule) return comboRule.combo_price;
    return cartList.reduce((s, v) => s + v.item.price * v.qty, 0);
  }, [cartList, isComboComplete, comboRule]);

  const debt = Math.max(0, totalPrice - subsidyAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isLocked) return;
    if (cartList.length === 0 && !isSelfCook) {
      toast.error('Vui lòng chọn ít nhất một món hoặc chọn tự nấu');
      return;
    }

    setSubmitting(true);
    try {
      const itemIds = cartList.flatMap(v => Array(v.qty).fill(v.item.id));
      
      const res = await orderApi.create({
        session_id: id,
        item_ids: itemIds,
        is_self_cook: isSelfCook,
        note: note
      });

      const { debt_amount } = res.data;
      if (debt_amount > 0) {
        toast.success(`Đặt món thành công! Còn nợ ${debt_amount.toLocaleString()}đ 🌸`);
      } else {
        toast.success('Đặt món thành công! 🌸');
      }
      navigate('/my-orders');
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Buổi ăn đã chốt, không thể đặt thêm.');
        setIsLocked(true);
      } else {
        toast.error('Có lỗi xảy ra khi đặt món');
      }
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

  if (!session) return (
    <div className="empty-state">
      <div style={{ fontSize: '3rem' }}>🍃</div>
      <h3>Không tìm thấy buổi ăn</h3>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Quay lại</button>
    </div>
  );

  return (
    <div className="animate-fadein">
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ Menu hôm nay
            </div>
            <h1 className="page-title">🛒 {session.name}</h1>
            <p className="page-subtitle">{session.description || 'Chúc bạn có một bữa ăn ngon miệng!'}</p>
          </div>
          {comboRule && (
            <div style={{
              background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
              borderRadius: 'var(--r-xl)',
              padding: '10px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#f0c040',
            }}>
              <Zap size={16} color="#f0c040" />
              <div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Combo</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{comboRule.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Combo progress bar */}
        {comboRule && (
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6, color: 'var(--c-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={12} color="#f0c040" />
                {isComboComplete
                  ? <span style={{ color: 'var(--c-success)', fontWeight: 700 }}>🎉 Đã đủ combo! Giá: {comboRule.combo_price.toLocaleString()}đ</span>
                  : <span>Chọn thêm <strong style={{ color: 'var(--c-primary)' }}>{comboRule.required_items - totalItems}</strong> món để kích hoạt combo</span>
                }
              </span>
              <span style={{ fontWeight: 700 }}>{totalItems}/{comboRule.required_items}</span>
            </div>
            <div style={{ height: 6, background: 'var(--c-border-light)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (totalItems / comboRule.required_items) * 100)}%`,
                background: isComboComplete
                  ? 'linear-gradient(90deg, #5bc76b, #3aad4a)'
                  : 'linear-gradient(90deg, var(--c-primary), var(--c-accent))',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {isLocked ? (
        <div className="card" style={{ maxWidth: 640, margin: '40px auto', border: 'none', background: 'transparent' }}>
          <div className="card-body" style={{ padding: 'var(--sp-12)', textAlign: 'center', background: 'var(--c-surface)', borderRadius: 'var(--r-2xl)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: 'var(--sp-6)', animation: 'float 4s ease-in-out infinite' }}>🍱</div>
            <h2 style={{ color: 'var(--c-primary)', marginBottom: 'var(--sp-3)', fontSize: '1.8rem' }}>Đơn hàng đã chốt!</h2>
            <div className="jp-divider" style={{ margin: 'var(--sp-6) auto', width: '60%' }}>CLOSED</div>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--c-text-muted)', maxWidth: 400, margin: '0 auto' }}>
              Admin đang đi lấy cơm cho mọi người rồi. <br />
              <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>Cơm đã được đặt, hẹn gặp lại ngày mai!</span>
            </p>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--sp-8)', padding: '14px 40px' }} onClick={() => navigate('/')}>
              Quay về trang chủ 🌸
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid-2" style={{ alignItems: 'start', gap: 'var(--sp-8)' }}>
          {/* ── Left: Menu list ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <div style={{ padding: '0 0 var(--sp-4) 0', fontWeight: 800, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                <Utensils size={22} color="var(--c-primary)" />
                {comboRule ? `Chọn ${comboRule.required_items} món cho combo` : 'Thực đơn của tiệm'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
                {session.categories?.map(cat => (
                  <div key={cat.id}>
                    <div className="jp-divider" style={{ marginBottom: 'var(--sp-4)' }}>{cat.name.toUpperCase()}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-3)' }}>
                      {cat.items?.map(item => {
                        const inCart = cart[item.id];
                        const qty = inCart?.qty || 0;
                        const isSelected = qty > 0;

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '14px 18px',
                              background: isSelected ? 'linear-gradient(135deg, var(--c-primary-soft), #fff)' : 'var(--c-surface)',
                              border: `2px solid ${isSelected ? 'var(--c-primary)' : 'var(--c-border-light)'}`,
                              borderRadius: 'var(--r-lg)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 8px 20px rgba(201,116,147,0.12)' : 'var(--shadow-card)',
                              transform: isSelected ? 'scale(1.01)' : 'none',
                            }}
                            onClick={() => !comboRule && addItem(item)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                🍱
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: '0.95rem' }}>{item.name}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--c-primary-dark)', fontWeight: 600 }}>{(item.price || 0).toLocaleString()}đ</div>
                              </div>
                            </div>

                            {comboRule ? (
                              /* Multi-select controls */
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                                {qty > 0 && (
                                  <button type="button" onClick={() => removeItem(item.id)}
                                    style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--c-border-light)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={14} />
                                  </button>
                                )}
                                {qty > 0 && (
                                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center', color: 'var(--c-primary)' }}>{qty}</span>
                                )}
                                <button type="button" onClick={() => addItem(item)}
                                  disabled={isComboComplete && !inCart}
                                  style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: isComboComplete && !inCart ? '#eee' : 'var(--c-primary)',
                                    border: 'none', cursor: isComboComplete && !inCart ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff',
                                  }}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              /* Single-select check */
                              isSelected && (
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Check size={16} strokeWidth={4} />
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Self Cook */}
                <div style={{ marginTop: 'var(--sp-4)' }}>
                  <div className="jp-divider" style={{ marginBottom: 'var(--sp-4)' }}>TÙY CHỌN KHÁC</div>
                  <div
                    onClick={() => { setIsSelfCook(true); clearCart(); }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 18px',
                      background: isSelfCook ? 'linear-gradient(135deg, var(--c-accent-light), #fff)' : 'var(--c-surface)',
                      border: `2px solid ${isSelfCook ? 'var(--c-accent)' : 'var(--c-border-light)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: isSelfCook ? '0 8px 20px rgba(212,168,83,0.12)' : 'var(--shadow-card)',
                      transform: isSelfCook ? 'scale(1.01)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--c-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🍳</div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: '0.95rem' }}>Tự nấu / Mang cơm đi</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--c-accent-dark)', fontWeight: 600 }}>
                          Cộng trợ cấp: {subsidyAmount.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    {isSelfCook && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order Sidebar ── */}
          <div style={{ position: 'sticky', top: 'var(--sp-6)' }}>
            <div className="card" style={{ borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
              <div className="card-header" style={{ background: 'var(--c-bg-alt)', color: 'var(--c-text)', padding: 'var(--sp-5) var(--sp-6)' }}>
                <ChefHat size={18} style={{ marginRight: 8 }} /> Chi tiết đơn hàng
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

                {/* Cart items */}
                {cartList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShoppingCart size={12} /> Giỏ hàng
                      </span>
                      <button type="button" onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                        <X size={12} /> Xóa hết
                      </button>
                    </div>
                    {cartList.map(({ item, qty }) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>
                          {item.name}{qty > 1 ? ` ×${qty}` : ''}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--c-primary-dark)' }}>
                          {(item.price * qty).toLocaleString()}đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Combo badge */}
                {isComboComplete && comboRule && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(91,200,107,0.15), rgba(91,200,107,0.05))',
                    border: '1px solid rgba(91,200,107,0.4)',
                    borderRadius: 'var(--r-lg)', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: 'var(--c-success)',
                  }}>
                    <Zap size={16} color="#f0c040" />
                    <div style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 800 }}>🎉 {comboRule.name} đã kích hoạt!</div>
                      <div style={{ opacity: 0.8 }}>Giá combo: {comboRule.combo_price.toLocaleString()}đ</div>
                    </div>
                  </div>
                )}

                {/* Subsidy */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--c-text-muted)' }}>Trợ cấp của bạn:</span>
                  <span style={{ fontWeight: 700, color: 'var(--c-success)' }}>+{subsidyAmount.toLocaleString()}đ</span>
                </div>

                {/* Total */}
                {cartList.length > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--c-text-muted)' }}>
                        {isComboComplete ? 'Giá combo:' : 'Giá món ăn:'}
                      </span>
                      <span style={{ fontWeight: 700 }}>-{totalPrice.toLocaleString()}đ</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: 'var(--sp-4)',
                      background: debt > 0 ? 'var(--c-danger-bg)' : 'var(--c-success-bg)',
                      color: debt > 0 ? 'var(--c-danger)' : 'var(--c-success)',
                      borderRadius: 'var(--r-lg)',
                      border: `1px solid ${debt > 0 ? 'rgba(192,68,79,0.2)' : 'rgba(91,155,107,0.2)'}`,
                    }}>
                      <div style={{ fontWeight: 600 }}>TỔNG THANH TOÁN:</div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{debt.toLocaleString()}đ</div>
                    </div>
                  </>
                )}

                {isSelfCook && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-4)',
                    background: 'var(--c-success-bg)', color: 'var(--c-success)',
                    borderRadius: 'var(--r-lg)', border: '1px solid rgba(91,155,107,0.2)',
                  }}>
                    <div style={{ fontWeight: 600 }}>TỔNG TÍCH LŨY:</div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>+{subsidyAmount.toLocaleString()}đ</div>
                  </div>
                )}

                {/* Note */}
                <div className="input-group" style={{ marginTop: 'var(--sp-2)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>✍️ Ghi chú đặc biệt</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Không hành, nhiều cơm, món lẻ..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{ borderRadius: 'var(--r-lg)', resize: 'none' }}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg w-full"
                  type="submit"
                  disabled={submitting || (cartList.length === 0 && !isSelfCook)}
                  style={{ height: 56, marginTop: 'var(--sp-2)' }}
                >
                  {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '🌸 Gửi đơn hàng ngay'}
                </button>

                <div style={{ background: 'rgba(74,127,165,0.05)', padding: '12px', borderRadius: 'var(--r-md)', display: 'flex', gap: 10, color: 'var(--c-info)' }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                    Đơn hàng sẽ được lưu vào danh sách chờ. Bạn có thể sửa/hủy trước khi Admin chốt.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

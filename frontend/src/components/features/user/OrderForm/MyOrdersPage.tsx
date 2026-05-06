import { useEffect, useState } from 'react';
import { orderApi } from '@/api';
import { Order } from '@/types';
import toast from 'react-hot-toast';
import { Calendar, ShoppingBag, Clock, History, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.myOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Không thể tải lịch sử đơn hàng'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Chờ xử lý', color: 'var(--c-warning)', bg: 'var(--c-warning-bg)', icon: '⏳' };
      case 'confirmed': return { label: 'Đã xác nhận', color: 'var(--c-success)', bg: 'var(--c-success-bg)', icon: '✅' };
      case 'shipping': return { label: 'Đang giao', color: 'var(--c-info)', bg: 'var(--c-info-bg)', icon: '🛵' };
      case 'delivered': return { label: 'Đã nhận', color: 'var(--c-delivered)', bg: '#EDE9FE', icon: '🍱' };
      case 'cancelled': return { label: 'Đã hủy', color: 'var(--c-danger)', bg: 'var(--c-danger-bg)', icon: '❌' };
      default: return { label: status, color: 'var(--c-text-muted)', bg: 'var(--c-bg-alt)', icon: '•' };
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
      <div className="page-header" style={{ paddingBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ 注文履歴
            </div>
            <h1 className="page-title">📝 Đơn hàng của tôi</h1>
            <p className="page-subtitle">Theo dõi hành trình bữa ăn của bạn.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <History size={24} color="var(--c-primary)" style={{ opacity: 0.6 }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ border: 'none', background: 'transparent' }}>
          <div className="card-body empty-state" style={{ background: 'var(--c-surface)', borderRadius: 'var(--r-2xl)', padding: 'var(--sp-12)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-4)' }}>🍱</div>
            <h3 style={{ color: 'var(--c-text)', marginBottom: 'var(--sp-2)' }}>Chưa có đơn hàng nào</h3>
            <p className="page-subtitle" style={{ maxWidth: 300 }}>
              注文はまだありません · Hình như bạn chưa đặt món nào cả!
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {orders.map((order, idx) => {
            const status = getStatusInfo(order.status);
            return (
              <div 
                key={order.id} 
                className="card" 
                style={{ 
                  border: 'none', 
                  borderRadius: 'var(--r-xl)',
                  animationDelay: `${idx * 0.05}s`,
                  overflow: 'visible'
                }}
              >
                {/* Decorative side tag */}
                <div style={{ 
                  position: 'absolute', left: -8, top: 20, width: 16, height: 40, 
                  background: status.color, borderRadius: '4px 0 0 4px', opacity: 0.8 
                }} />

                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-6)', padding: 'var(--sp-6)' }}>
                  {/* Status & Date */}
                  <div style={{ flex: '0 0 160px' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: 6, 
                      padding: '4px 12px', borderRadius: 'var(--r-full)', 
                      background: status.bg, color: status.color, 
                      fontSize: '0.75rem', fontWeight: 800, marginBottom: 12
                    }}>
                      <span>{status.icon}</span>
                      {status.label.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                      <Clock size={14} />
                      {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>
                      🌸 {order.session?.name?.toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--c-text)', lineHeight: 1.3 }}>
                      {order.is_self_cook ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          🍳 Tự chuẩn bị cơm
                        </span>
                      ) : (
                        <>
                          {order.items && order.items.length > 1 && (
                            <span style={{ 
                              fontSize: '0.6rem', background: 'var(--c-primary)', 
                              color: '#fff', padding: '2px 8px', borderRadius: '4px',
                              verticalAlign: 'middle', marginRight: 8, fontWeight: 900
                            }}>COMBO</span>
                          )}
                          {order.items && order.items.length > 0 
                            ? order.items.map(i => i.menu_item?.name).filter(Boolean).join(' + ')
                            : order.menu_item?.name}
                        </>
                      )}
                    </h3>
                    <div className="jp-divider" style={{ margin: '8px 0', opacity: 0.3 }} />
                    <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--c-text-muted)' }}>Giá món: </span>
                        <span style={{ fontWeight: 600 }}>{order.item_price > 0 ? `${order.item_price.toLocaleString()}đ` : '-'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--c-text-muted)' }}>Trợ cấp: </span>
                        <span style={{ fontWeight: 700, color: 'var(--c-success)' }}>
                          {order.company_subsidy > 0 ? `-${order.company_subsidy.toLocaleString()}đ` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Result */}
                  <div style={{ 
                    flex: '0 0 150px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'flex-end',
                    borderLeft: '1px dashed var(--c-border-light)',
                    paddingLeft: 'var(--sp-6)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', marginBottom: 2 }}>NỢ CẦN TRẢ</div>
                    <div style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: 900, 
                      color: order.debt_amount > 0 ? 'var(--c-danger)' : 'var(--c-success)',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {order.debt_amount > 0 ? `${order.debt_amount.toLocaleString()}đ` : '0đ'}
                    </div>
                    {order.debt_amount === 0 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--c-success)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <CheckCircle2 size={12} /> Đã thanh toán
                      </div>
                    )}
                  </div>

                  {/* Action Link (Optional hover effect) */}
                  <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }}>
                     <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer message */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: 'var(--sp-10)', 
        color: 'var(--c-text-muted)',
        fontSize: '0.8rem',
        fontStyle: 'italic'
      }}>
        Cảm ơn bạn đã đồng hành cùng bữa trưa 2BS Order! 🌸
      </div>
    </div>
  );
}

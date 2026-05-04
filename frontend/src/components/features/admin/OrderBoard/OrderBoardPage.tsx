import { useEffect, useState } from 'react';
import { orderApi, sessionApi } from '@/api';
import { Order, OrderStatus, WS_EVENTS, MealSession } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  Truck, PackageCheck,
  XCircle, Clock, Filter, Ghost, X, List
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: 'Chờ xử lý', icon: Clock, color: '#FFD166', bg: '#FFF9E6' },
  shipping: { label: 'Đang giao', icon: Truck, color: '#118AB2', bg: '#E8F4FD' },
  delivered: { label: 'Hoàn thành', icon: PackageCheck, color: '#7B61FF', bg: '#F2F0FF' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: '#EF476F', bg: '#FEECF1' },
};

// CSS for printing the invoice
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden; }
    #invoice-print-area, #invoice-print-area * { 
      visibility: visible; 
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: #fffcf5 !important;
      padding: 40px;
    }
  }
`;

export default function OrderBoardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessions, setSessions] = useState<MealSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionID, setSelectedSessionID] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [orderRes, sessRes] = await Promise.all([
        orderApi.listAdmin({ session_id: selectedSessionID }),
        sessionApi.listAdmin()
      ]);
      setOrders(orderRes.data);
      setSessions(sessRes.data);
    } catch {
      toast.error('Không thể tải dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedSessionID]);

  // Realtime handlers
  useWebSocket({
    [WS_EVENTS.NEW_ORDER]: (payload: unknown) => {
      const newOrder = payload as Order;
      setOrders(prev => [newOrder, ...prev]);
      toast('🔔 Có đơn hàng mới!', { duration: 5000, position: 'top-right' });
      try { new Audio('/notification.mp3').play(); } catch { }
    },
    [WS_EVENTS.ORDER_STATUS_CHANGED]: (payload: unknown) => {
      const { order_id, status } = payload as { order_id: string; status: OrderStatus };
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o));
    }
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      let finalStatus = status;
      const order = orders.find(o => o.id === id);

      // Special logic: Self-cook goes straight to delivered when "shipping" is requested from pending
      if (order && order.status === 'pending' && status === 'shipping' && order.is_self_cook) {
        finalStatus = 'delivered';
      }

      await orderApi.updateStatus(id, finalStatus as OrderStatus);
      toast.success(`Đã chuyển sang ${STATUS_CONFIG[finalStatus].label}`);
      fetchInitialData();
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleBatchUpdate = async (fromStatus: string, toStatus: string) => {
    const targets = orders.filter(o => o.status === fromStatus);
    if (targets.length === 0) return;

    const selfCookCount = targets.filter(o => o.is_self_cook).length;
    const regularCount = targets.length - selfCookCount;

    let confirmMsg = `Bạn có chắc muốn cập nhật ${targets.length} đơn hàng?`;
    if (fromStatus === 'pending') {
      confirmMsg = `Xác nhận giao hàng:\n- ${regularCount} đơn sẽ chuyển sang ĐANG GIAO\n- ${selfCookCount} đơn tự nấu sẽ chuyển thẳng sang HOÀN THÀNH`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      await Promise.all(targets.map(o => {
        let finalStatus = toStatus;
        // Special logic: Self-cook goes straight to delivered if coming from pending
        if (fromStatus === 'pending' && o.is_self_cook) {
          finalStatus = 'delivered';
        }
        return orderApi.updateStatus(o.id, finalStatus as OrderStatus);
      }));
      toast.success('Đã cập nhật hàng loạt thành công 🌸');
      fetchInitialData();
    } catch {
      toast.error('Có lỗi khi cập nhật hàng loạt');
    }
  };

  const ordersByStatus = (status: string) => orders.filter(o => o.status === status);

  const getSummary = () => {
    const summary: Record<string, { count: number; userDetails: { name: string; note: string }[] }> = {};
    orders.filter(o => o.status === 'pending').forEach(o => {
      const name = o.is_self_cook ? 'Tự chuẩn bị (Mang cơm)' : (o.menu_item?.name || 'Món khác');
      if (!summary[name]) summary[name] = { count: 0, userDetails: [] };
      summary[name].count++;
      summary[name].userDetails.push({
        name: o.user?.full_name || 'N/A',
        note: o.note || ''
      });
    });
    return summary;
  };

  const handleCopySummary = () => {
    const summaryData = getSummary();
    const sessionName = sessions.find(s => s.id === selectedSessionID)?.name || 'Hôm nay';
    let text = `--- 📋 TỔNG HỢP ĐƠN HÀNG [${sessionName.toUpperCase()}] ---\n\n`;

    let totalItems = 0;
    Object.entries(summaryData).forEach(([name, data], index) => {
      totalItems += data.count;
      const details = data.userDetails.map(u => `${u.name}${u.note ? ` (${u.note})` : ''}`).join(', ');
      text += `${index + 1}. ${name}: ${data.count} suất\n   👉 (${details})\n\n`;
    });

    text += `=> TỔNG CỘNG: ${totalItems} SUẤT\n`;
    text += `------------------------------------------`;

    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép danh sách vào bộ nhớ tạm! 📋');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="animate-fadein">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">📦 Quản lý đơn hàng</h1>
          <p className="page-subtitle">Xem tổng hợp món và điều phối giao hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setShowSummary(true)}>
            <List size={18} style={{ marginRight: 8 }} />
            Tổng hợp món ăn
          </button>
          <div style={{ width: 1, height: 32, background: 'var(--c-border)' }} />
          <select
            className="input"
            style={{ width: 220 }}
            value={selectedSessionID}
            onChange={(e) => setSelectedSessionID(e.target.value)}
          >
            <option value="">Tất cả buổi ăn</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="order-kanban" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', minHeight: '70vh' }}>
        {['pending', 'shipping', 'delivered', 'cancelled'].map(status => {
          const config = STATUS_CONFIG[status];
          const list = ordersByStatus(status);

          return (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{
                padding: 'var(--sp-3) var(--sp-4)',
                background: config.bg,
                color: config.color,
                borderRadius: 'var(--r-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <config.icon size={16} />
                  {config.label.toUpperCase()}
                </div>
                <span>{list.length}</span>
              </div>

              {status === 'pending' && list.length > 0 && (
                <button className="btn btn-outline btn-sm w-full" onClick={() => handleBatchUpdate('pending', 'shipping')}>
                  🚚 Giao tất cả ({list.length})
                </button>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {list.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-12)', opacity: 0.2 }}>
                    <Ghost size={32} style={{ margin: '0 auto' }} />
                  </div>
                ) : (
                  list.map(order => (
                    <div key={order.id} className="order-card" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{order.user?.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                          {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem' }}>
                        {order.is_self_cook ? (
                          <div style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>🍳 Tự chuẩn bị</div>
                        ) : (
                          <div style={{ fontWeight: 600, color: 'var(--c-primary-dark)' }}>🍱 {order.menu_item?.name}</div>
                        )}
                        {order.note && <div style={{ marginTop: 4, padding: '4px 8px', background: 'var(--c-bg-alt)', borderRadius: 4, fontSize: '0.75rem' }}>💬 {order.note}</div>}
                      </div>

                      <div style={{ display: 'flex', gap: '4px', marginTop: 'var(--sp-1)' }}>
                        {status === 'pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(order.id, 'shipping')}>Giao hàng</button>
                        )}
                        {status === 'shipping' && (
                          <button className="btn btn-primary btn-sm" style={{ background: '#06D6A0', color: 'white' }} onClick={() => handleUpdateStatus(order.id, 'delivered')}>Xong</button>
                        )}
                        {status !== 'delivered' && status !== 'cancelled' && (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--c-danger)' }} onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Hủy</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSummary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <style>{PRINT_STYLES}</style>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                📋 Chi tiết hóa đơn tổng hợp
              </h3>
              <button className="btn-icon" onClick={() => setShowSummary(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ background: 'var(--c-bg-alt)', padding: 'var(--sp-6)' }}>

              {/* Restaurant Style Invoice Area */}
              <div id="invoice-print-area"
                className="receipt-paper"
                style={{
                  padding: 'var(--sp-10)',
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#2C1A24',
                  marginTop: 8,
                }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)', marginTop: 8 }}>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '6px', color: '#C9748F', marginBottom: 6, textTransform: 'uppercase' }}>
                    ✦ 2BS Order System ✦
                  </div>
                  <h1 style={{ margin: 0, letterSpacing: '5px', fontSize: '1.9rem', fontWeight: 900, color: '#2C1A24' }}>RECEIPT</h1>
                  <h2 style={{ margin: '6px 0 0', fontSize: '0.95rem', textTransform: 'uppercase', fontWeight: 400, color: '#8A6070', letterSpacing: '3px' }}>
                    HÓA ĐƠN ĐẶT CƠM
                  </h2>
                  <div style={{ margin: '14px 0 4px', fontSize: '0.85rem', fontWeight: 700, color: '#A0506A' }}>
                    🌸 {sessions.find(s => s.id === selectedSessionID)?.name?.toUpperCase() || 'HỆ THỐNG 2BS ORDER'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8A6070' }}>
                    📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ margin: '12px 0 0', color: '#C9748F', letterSpacing: '3px', fontSize: '0.75rem' }}>
                    ────────── ✿ ──────────
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-6)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', fontSize: '0.9rem' }}>
                        <th style={{ padding: '8px 0' }}>MÓN ĂN / ITEMS</th>
                        <th style={{ padding: '8px 0', textAlign: 'center', width: 60 }}>SL</th>
                        <th style={{ padding: '8px 0', textAlign: 'right' }}>GHI CHÚ CHI TIẾT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(getSummary()).map(([name, data]) => (
                        <tr key={name} style={{ borderBottom: '1px dashed #ccc', fontSize: '0.95rem' }}>
                          <td style={{ padding: '15px 0', verticalAlign: 'top', fontWeight: 'bold' }}>
                            {name.toUpperCase()}
                          </td>
                          <td style={{ padding: '15px 0', textAlign: 'center', verticalAlign: 'top', fontWeight: 800 }}>
                            {data.count}
                          </td>
                          <td style={{ padding: '15px 0', textAlign: 'right', fontSize: '0.85rem' }}>
                            {data.userDetails.map((u, i) => (
                              <div key={i} style={{ marginBottom: 4 }}>
                                <span style={{ opacity: 0.8 }}>{u.name}</span>
                                {u.note && (
                                  <span style={{
                                    marginLeft: 6,
                                    padding: '2px 6px',
                                    background: 'rgba(239, 71, 111, 0.1)',
                                    color: '#EF476F',
                                    borderRadius: 4,
                                    fontWeight: 'bold'
                                  }}>
                                    ★ {u.note}
                                  </span>
                                )}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '2px dashed #D4A853', paddingTop: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', maxWidth: '55%', color: '#8A6070', lineHeight: 1.6 }}>
                    Đơn hàng được tổng hợp tự động bởi hệ thống 2BS Order.
                    <div style={{ marginTop: 4, fontSize: '0.7rem' }}>⏰ {new Date().toLocaleTimeString('vi-VN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8A6070', letterSpacing: '1px' }}>TỔNG SỐ SUẤT</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#C9748F', lineHeight: 1 }}>{ordersByStatus('pending').length}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)', marginBottom: 4 }}>
                  <div style={{ color: '#C9748F', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: 8 }}>
                    ────────── ✿ ──────────
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#A0506A', letterSpacing: '1px' }}>
                    🌸 ありがとうございます 🌸
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8A6070', marginTop: 4 }}>Xin cảm ơn, hẹn gặp lại!</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', padding: 'var(--sp-4) var(--sp-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button className="btn btn-outline" onClick={handleCopySummary} title="Copy văn bản Zalo">
                  📋 Copy văn bản
                </button>
                <button className="btn btn-outline" onClick={handlePrint} style={{ borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}>
                  🖨️ In hóa đơn
                </button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button className="btn btn-ghost" onClick={() => setShowSummary(false)}>Đóng</button>
                <button
                  className="btn btn-primary"
                  disabled={ordersByStatus('pending').length === 0}
                  onClick={() => { setShowSummary(false); handleBatchUpdate('pending', 'shipping'); }}
                >
                  🚀 Giao tất cả {ordersByStatus('pending').length} đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

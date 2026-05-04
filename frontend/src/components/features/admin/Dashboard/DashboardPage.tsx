import { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import { DashboardSummary, MonthlyStat, WeeklyStat } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users as UsersIcon, ShoppingCart, AlertCircle, Banknote, ShoppingBag, Calendar, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStat[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.monthly(new Date().getFullYear()),
      dashboardApi.weekly(new Date().getFullYear())
    ]).then(([sumRes, monthRes, weekRes]) => {
      setSummary(sumRes.data || null);
      setMonthly(monthRes.data || []);
      setWeekly(weekRes.data || []);
    }).catch(() => toast.error('Không thể tải dữ liệu dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const stats = [
    { label: 'Tổng người dùng', value: summary?.total_users || 0, icon: UsersIcon, color: '#4A7FA5', bg: '#EBF3F9' },
    { label: 'Chờ duyệt', value: summary?.pending_users || 0, icon: AlertCircle, color: '#C0444F', bg: '#FBECEE' },
    { label: 'Đơn hàng tháng', value: summary?.total_orders || 0, icon: ShoppingCart, color: '#5B9B6B', bg: '#EEF7F1' },
    { label: 'Tổng nợ chưa trả', value: `${(summary?.total_debt || 0).toLocaleString()}đ`, icon: Banknote, color: '#D4A853', bg: '#FBF4E6' },
    { label: 'Tiền phải trả (Tự nấu)', value: `${(summary?.total_self_cook_to_pay || 0).toLocaleString()}đ`, icon: ChefHat, color: '#A0506A', bg: '#FDF0F4' },
  ];

  const chartData = viewMode === 'weekly' ? weekly : monthly;
  const xAxisKey = viewMode === 'weekly' ? 'week' : 'month';

  return (
    <div className="animate-fadein">
      {/* Japanese-style page header */}
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ Quản trị hệ thống
            </div>
            <h1 className="page-title">📊 Tổng quan</h1>
            <p className="page-subtitle">Nắm bắt tình hình đặt cơm và công nợ toàn hệ thống một cách toàn diện.</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
            <div style={{ fontSize: '1.5rem' }}>🌸</div>
            <div>{new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}</div>
            <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'var(--sp-4)', 
        marginBottom: 'var(--sp-8)' 
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-value" style={{ fontSize: stat.value.toString().length > 10 ? '1.5rem' : '1.9rem' }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <TrendingUp size={18} /> Thống kê chi phí {viewMode === 'weekly' ? 'theo tuần' : 'theo tháng'}
            </div>
            <div style={{ display: 'flex', background: '#F7EEF2', borderRadius: '12px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('weekly')}
                style={{
                  padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px',
                  background: viewMode === 'weekly' ? '#fff' : 'transparent',
                  color: viewMode === 'weekly' ? 'var(--c-primary)' : 'var(--c-text-muted)',
                  boxShadow: viewMode === 'weekly' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >Tuần</button>
              <button
                onClick={() => setViewMode('monthly')}
                style={{
                  padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px',
                  background: viewMode === 'monthly' ? '#fff' : 'transparent',
                  color: viewMode === 'monthly' ? 'var(--c-primary)' : 'var(--c-text-muted)',
                  boxShadow: viewMode === 'monthly' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >Tháng</button>
            </div>
          </div>
          <div className="card-body" style={{ height: 380 }}>
            {chartData.length === 0 ? (
              <div className="empty-state">Chưa có dữ liệu thống kê</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis
                    dataKey={xAxisKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--c-primary-soft)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: 'var(--r-md)', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.9rem' }}
                    formatter={(v: number, name: string) => [
                      `${v.toLocaleString()}đ`,
                      name === 'total_spent' ? 'Chi phí trợ cấp' : 'Chi phí thực tế'
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600, paddingBottom: 20 }}
                    formatter={(val) => val === 'total_spent' ? 'Trợ cấp' : 'Giá trị thực'}
                  />
                  <Bar name="actual_spent" dataKey="actual_spent" fill="#D4A853" radius={[4, 4, 0, 0]} barSize={viewMode === 'weekly' ? 12 : 20} />
                  <Bar name="total_spent" dataKey="total_spent" fill="#C9748F" radius={[4, 4, 0, 0]} barSize={viewMode === 'weekly' ? 12 : 20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Calendar size={18} /> Ghi chú quản lý
            </div>
          </div>
          <div className="card-body">
            <div style={{ padding: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                <div style={{ flex: 1, padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: '#F8F9FA', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Trợ cấp cao nhất</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--c-primary)' }}>
                    {Math.max(...chartData.map(d => d.total_spent), 0).toLocaleString()}đ
                  </div>
                </div>
                <div style={{ flex: 1, padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: '#F8F9FA', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Giá trị thực cao nhất</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--c-accent)' }}>
                    {Math.max(...chartData.map(d => d.actual_spent), 0).toLocaleString()}đ
                  </div>
                </div>
              </div>

              <ul style={{ padding: 0, listStyle: 'none', fontSize: '0.9rem', color: 'var(--c-text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-primary)' }} />
                  Dữ liệu được cập nhật từ các đơn hàng thành công.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-primary)' }} />
                  Bao gồm cả chi phí công ty và phí nhân viên trả thêm.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-primary)' }} />
                  Chế độ xem theo tuần dựa trên mã tuần ISO.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

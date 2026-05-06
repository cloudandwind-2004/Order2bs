import { useEffect, useState } from 'react';
import { adminUserApi } from '@/api';
import { User } from '@/types';
import { Check, X, Trash2, Search, Filter, UserCog, UserCheck, UserPlus, ShieldAlert, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminUserApi.list(filter)
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await adminUserApi.approve(id);
      toast.success('Đã duyệt tài khoản thành công! 🌸');
      fetchUsers();
    } catch {
      toast.error('Lỗi khi duyệt tài khoản');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối tài khoản này?')) return;
    try {
      await adminUserApi.reject(id);
      toast.success('Đã từ chối tài khoản');
      fetchUsers();
    } catch {
      toast.error('Lỗi khi từ chối tài khoản');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await adminUserApi.delete(id);
      toast.success('Đã xóa người dùng khỏi hệ thống');
      fetchUsers();
    } catch {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser?.id) return;
    setUpdating(true);
    try {
      await adminUserApi.update(editingUser.id, {
        role_in_company: editingUser.role_in_company,
        role: editingUser.role
      });
      toast.success('Cập nhật nhân viên thành công!');
      setShowEditModal(false);
      fetchUsers();
    } catch {
      toast.error('Lỗi khi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.phone.includes(search)
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
              ✦ ユーザー管理
            </div>
            <h1 className="page-title">👥 Quản lý người dùng</h1>
            <p className="page-subtitle">Duyệt và quản lý nhân viên tham gia hệ thống đặt cơm.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
             <div style={{ 
               background: '#fff', padding: '10px 16px', borderRadius: 'var(--r-lg)', 
               boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12,
               border: '1px solid var(--c-border-light)'
             }}>
                <Search size={18} color="var(--c-text-muted)" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: 220 }}
                />
             </div>
             <select 
               className="input" 
               style={{ width: 160, borderRadius: 'var(--r-lg)', background: '#fff' }}
               value={filter}
               onChange={e => setFilter(e.target.value)}
             >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ chốt duyệt</option>
                <option value="approved">Đã kích hoạt</option>
                <option value="rejected">Bị chặn/Từ chối</option>
             </select>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)', height: 2, background: 'linear-gradient(90deg, var(--c-primary-light), var(--c-accent-light), transparent)' }} />
      </div>

      <div className="card" style={{ border: 'none', borderRadius: 'var(--r-xl)' }}>
        <div className="table-container" style={{ border: 'none' }}>
          {loading ? (
            <div className="loading-overlay" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 300 }}>
               <div style={{ fontSize: '3rem' }}>🍃</div>
               <h3>Không tìm thấy dữ liệu</h3>
               <p style={{ color: 'var(--c-text-muted)' }}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ background: 'transparent', paddingLeft: 24 }}>THÔNG TIN NHÂN VIÊN</th>
                  <th style={{ background: 'transparent' }}>SỐ ĐIỆN THOẠI</th>
                  <th style={{ background: 'transparent' }}>BỘ PHẬN</th>
                  <th style={{ background: 'transparent' }}>TRẠNG THÁI</th>
                  <th style={{ background: 'transparent' }}>NGÀY THAM GIA</th>
                  <th style={{ background: 'transparent', textAlign: 'right', paddingRight: 24 }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody style={{ background: 'transparent' }}>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="animate-fadein" style={{ boxShadow: '0 2px 8px rgba(44, 26, 36, 0.04)' }}>
                    <td style={{ borderTopLeftRadius: 'var(--r-lg)', borderBottomLeftRadius: 'var(--r-lg)', padding: '16px 24px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', borderLeft: '1px solid var(--c-border-light)', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 'var(--r-md)', 
                          background: user.role === 'admin' ? 'var(--c-accent-light)' : 'var(--c-primary-soft)',
                          color: user.role === 'admin' ? 'var(--c-accent-dark)' : 'var(--c-primary-dark)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(201, 116, 143, 0.2)'
                        }}>
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: '0.95rem' }}>{user.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', background: '#fff', fontSize: '0.88rem', fontWeight: 600 }}>{user.phone}</td>
                    <td style={{ padding: '16px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', background: '#fff', fontSize: '0.88rem' }}>{user.role_in_company || '—'}</td>
                    <td style={{ padding: '16px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', background: '#fff' }}>
                      {user.status === 'pending' && <span className="badge badge-pending">CHỜ DUYỆT</span>}
                      {user.status === 'approved' && <span className="badge badge-approved">ĐÃ KÍCH HOẠT</span>}
                      {user.status === 'rejected' && <span className="badge badge-rejected">BỊ CHẶN</span>}
                    </td>
                    <td style={{ padding: '16px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', background: '#fff', fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ borderTopRightRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)', padding: '16px 24px', borderTop: '1px solid var(--c-border-light)', borderBottom: '1px solid var(--c-border-light)', borderRight: '1px solid var(--c-border-light)', background: '#fff', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {user.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-primary btn-sm" 
                              style={{ width: 32, height: 32, padding: 0, borderRadius: 'var(--r-md)' }}
                              title="Duyệt nhân viên"
                              onClick={() => handleApprove(user.id)}
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                            <button 
                              className="btn btn-outline btn-sm" 
                              style={{ width: 32, height: 32, padding: 0, borderRadius: 'var(--r-md)', color: 'var(--c-danger)', borderColor: 'rgba(192, 68, 79, 0.3)' }}
                              title="Từ chối"
                              onClick={() => handleReject(user.id)}
                            >
                              <X size={16} strokeWidth={3} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn-icon" 
                          style={{ color: 'var(--c-primary)' }}
                          title="Chỉnh sửa thông tin"
                          onClick={() => { setEditingUser(user); setShowEditModal(true); }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ color: 'var(--c-text-light)' }}
                          title="Xóa vĩnh viễn"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
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

      <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-6)', background: 'var(--c-primary-soft)', borderRadius: 'var(--r-xl)', display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', border: '1px dashed var(--c-primary-light)' }}>
         <div style={{ fontSize: '2rem' }}>💮</div>
         <div>
            <div style={{ fontWeight: 800, color: 'var(--c-primary-dark)', fontSize: '0.95rem' }}>Hướng dẫn quản trị</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', marginTop: 2 }}>
               Nhân viên mới cần được phê duyệt trước khi có thể đặt cơm. Bạn có thể tìm kiếm theo tên hoặc lọc theo trạng thái để xử lý nhanh hơn.
            </p>
         </div>
      </div>
      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400, width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCog size={20} color="var(--c-primary)" /> Chỉnh sửa nhân viên
              </h3>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>HỌ TÊN</label>
                <input className="input" value={editingUser.full_name} disabled style={{ background: 'var(--c-bg-alt)' }} />
              </div>
              <div className="input-group" style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>BỘ PHẬN / ROLE TRONG CÔNG TY</label>
                <input 
                  className="input" 
                  value={editingUser.role_in_company || ''} 
                  onChange={e => setEditingUser({ ...editingUser, role_in_company: e.target.value })} 
                  placeholder="Ví dụ: Dev, HR, BA..."
                />
              </div>
              <div className="input-group" style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>QUYỀN HỆ THỐNG</label>
                <select 
                  className="input" 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                >
                  <option value="user">Nhân viên (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? 'Đang lưu...' : 'Lưu thay đổi 🌸'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

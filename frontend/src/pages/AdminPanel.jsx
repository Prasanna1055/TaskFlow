import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Activity, Shield, Trash2, ToggleLeft, ToggleRight, TrendingUp, CheckCircle2, Clock, Circle } from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 50 }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(user) {
    try {
      await adminApi.updateUser(user._id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user'); }
  }

  async function promoteToAdmin(user) {
    if (!confirm(`Make ${user.name} an admin?`)) return;
    try {
      await adminApi.updateUser(user._id, { role: 'admin' });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: 'admin' } : u));
      toast.success('User promoted to admin');
    } catch { toast.error('Failed to update role'); }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user and all their tasks?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  }

  const tasksByStatus = stats?.stats?.tasksByStatus || [];
  const getStatus = (id) => tasksByStatus.find(s => s._id === id)?.count || 0;

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(3)].map((_, i) => <div key={i} style={{ height: 120, borderRadius: 16 }} className="skeleton" />)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#f87171" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage users and monitor system activity</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: Users, color: '#6366f1' },
          { label: 'Total Tasks', value: stats?.stats?.totalTasks || 0, icon: Activity, color: '#0ea5e9' },
          { label: 'Completed', value: getStatus('done'), icon: CheckCircle2, color: '#10b981' },
          { label: 'In Progress', value: getStatus('in-progress'), icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={18} color="#6366f1" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>All Users ({users.length})</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `hsl(${u.name.charCodeAt(0) * 10}, 60%, 40%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>{u.name[0].toUpperCase()}</div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>{u.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: u.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                      color: u.role === 'admin' ? '#fca5a5' : '#a5b4fc',
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: u.isActive ? '#6ee7b7' : '#fca5a5',
                    }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleUserStatus(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                        style={{ ...actionBtnStyle, color: u.isActive ? '#f59e0b' : '#10b981' }}>
                        {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => promoteToAdmin(u)} title="Make Admin"
                          style={{ ...actionBtnStyle, color: '#6366f1' }}>
                          <Shield size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteUser(u._id)} title="Delete User"
                        style={{ ...actionBtnStyle, color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Recently Joined</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recentUsers.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `hsl(${u.name.charCodeAt(0) * 10}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{u.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = {
  width: 30, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
  background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
};

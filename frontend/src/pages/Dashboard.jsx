import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, CheckCircle2, Clock, Circle,
  Trash2, Edit3, X, Save, ChevronDown, AlertCircle,
  TrendingUp, ListTodo, Loader,
} from 'lucide-react';

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', icon: Circle },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  done: { label: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 12 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.status) delete params.status;
      if (!params.priority) delete params.priority;
      const res = await taskApi.getAll(params);
      setTasks(res.data.tasks);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {stats.done} of {total} tasks completed
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Tasks', value: total, icon: ListTodo, color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
          { label: 'To Do', value: stats.todo, icon: Circle, color: '#94a3b8', glow: 'rgba(148,163,184,0.2)' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
          { label: 'Completed', value: stats.done, icon: CheckCircle2, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
        ].map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `rgba(${hexToRgb(color)},0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${glow}`,
            }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 32, padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={14} /> Overall Progress</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{Math.round((stats.done / total) * 100)}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${(stats.done / total) * 100}%`, background: 'linear-gradient(90deg, #10b981, #6366f1)', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." style={{ ...inputStyle, paddingLeft: 42, width: '100%' }} />
        </div>

        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
          style={{ ...inputStyle, minWidth: 130 }}>
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value, page: 1 }))}
          style={{ ...inputStyle, minWidth: 130 }}>
          <option value="">All Priority</option>
          {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>

        <button onClick={() => { setEditingTask(null); setShowModal(true); }} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
          fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
        }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 14 }} className="skeleton" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No tasks found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Create a new task to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredTasks.map(task => (
            <TaskCard key={task._id} task={task}
              onEdit={() => { setEditingTask(task); setShowModal(true); }}
              onDelete={() => handleDelete(task._id)}
              onStatusChange={(status) => handleStatusChange(task._id, status)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSave}
          submitting={submitting}
        />
      )}
    </div>
  );

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete task'); }
  }

  async function handleStatusChange(id, status) {
    try {
      await taskApi.update(id, { status });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  }

  async function handleSave(data) {
    setSubmitting(true);
    try {
      if (editingTask) {
        await taskApi.update(editingTask._id, data);
        toast.success('Task updated!');
      } else {
        await taskApi.create(data);
        toast.success('Task created!');
      }
      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  }
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const Icon = statusCfg.icon;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: 20, transition: 'all 0.2s', cursor: 'default',
      animation: 'fadeIn 0.3s ease',
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
      onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: priorityCfg.bg, color: priorityCfg.color,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{task.priority}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn icon={Edit3} onClick={onEdit} color="#6366f1" />
          <ActionBtn icon={Trash2} onClick={onDelete} color="#ef4444" />
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6, lineHeight: 1.4 }}>{task.title}</h3>
      {task.description && (
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <select value={task.status} onChange={e => onStatusChange(e.target.value)}
          style={{
            padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: statusCfg.bg, color: statusCfg.color,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {task.dueDate && (
          <span style={{ fontSize: 11, color: '#64748b' }}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.user && typeof task.user === 'object' && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#475569', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
          👤 {task.user.name}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#64748b', transition: 'all 0.2s',
    }}
      onMouseOver={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.color = color; }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
    >
      <Icon size={14} />
    </button>
  );
}

function TaskModal({ task, onClose, onSave, submitting }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });

  const f = (field) => e => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        padding: 32, width: '100%', maxWidth: 480, animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Title *">
            <input value={form.title} onChange={f('title')} placeholder="Task title..." style={inputStyle} required />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={f('description')} placeholder="Optional description..."
              rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Status">
              <select value={form.status} onChange={f('status')} style={inputStyle}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
            <FormField label="Priority">
              <select value={form.priority} onChange={f('priority')} style={inputStyle}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Due Date">
            <input type="date" value={form.dueDate} onChange={f('dueDate')} style={inputStyle} />
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500,
          }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={submitting || !form.title} style={{
            flex: 1, padding: 12, borderRadius: 10, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {submitting ? <span className="spinner" /> : <><Save size={16} /> {task ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0', fontSize: 14, outline: 'none',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '99,102,241';
}

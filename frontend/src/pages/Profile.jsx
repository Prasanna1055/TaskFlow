import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Save, Shield, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe(profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPass(false); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={13} color="#64748b" />
              <span style={{ fontSize: 13, color: '#64748b' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: user?.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                color: user?.role === 'admin' ? '#fca5a5' : '#a5b4fc',
                textTransform: 'uppercase', letterSpacing: 1,
                display: 'flex', alignItems: 'center', gap: 4,
              }}><Shield size={10} /> {user?.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <User size={16} color="#6366f1" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Personal Information</h3>
          </div>
          <FormInput label="Full Name" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
          <FormInput label="Email Address" type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
          <button type="submit" disabled={saving} style={primaryBtnStyle}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Lock size={16} color="#f59e0b" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Change Password</h3>
          </div>
          <FormInput label="Current Password" type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} />
          <FormInput label="New Password" type="password" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} />
          <FormInput label="Confirm New Password" type="password" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} />
          <button type="submit" disabled={changingPass} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
            {changingPass ? <span className="spinner" /> : <><Lock size={16} /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>{label}</label>
      <input {...props} style={{
        width: '100%', padding: '11px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0', fontSize: 14, outline: 'none',
      }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  );
}

const primaryBtnStyle = {
  padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  boxShadow: '0 4px 15px rgba(99,102,241,0.4)', fontSize: 14,
};

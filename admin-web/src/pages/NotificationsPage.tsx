import React, { useState } from 'react';
import { Send, Bell, Smartphone, Check } from 'lucide-react';
import apiClient from '../api/client';

const NOTIFICATION_TYPES = [
  { value: 'GENERAL_CIRCULAR', label: 'General Circular' },
  { value: 'MEETING_NOTICE', label: 'Meeting Notice' },
  { value: 'HOLIDAY_NOTICE', label: 'Holiday Notice' },
  { value: 'ATTENDANCE_REMINDER', label: 'Attendance Reminder' },
];
const ROLES = ['All Staff', 'STAFF', 'HR', 'MANAGER', 'ADMIN'];
const DEPARTMENTS = ['All Departments', 'Academics', 'Administration', 'Accounts', 'Library', 'Lab', 'Bus Staff', 'Security', 'Maintenance'];

export const NotificationsPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'GENERAL_CIRCULAR',
    targetRole: '',
    targetDepartment: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const f = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError('Title and message body are required.'); return; }
    setIsLoading(true); setError(''); setSuccess('');
    try {
      const payload: any = {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
      };
      if (form.targetRole && form.targetRole !== 'All Staff') payload.targetRole = form.targetRole;
      if (form.targetDepartment && form.targetDepartment !== 'All Departments') payload.targetDepartment = form.targetDepartment;

      const res: any = await apiClient.post('/notifications/send', payload);
      setSuccess(res.data?.message || 'Notification broadcasted successfully!');
      setForm({ title: '', body: '', type: 'GENERAL_CIRCULAR', targetRole: '', targetDepartment: '' });
    } catch (err: any) {
      setError(err?.message || 'Failed to send notification.');
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Info Banner */}
      <div className="card" style={{
        borderLeft: '3px solid var(--sky-500)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          backgroundColor: 'var(--sky-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#06B6D4',
        }}>
          <Bell size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', marginBottom: '2px' }}>
            Broadcast Announcement
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Notifications are delivered instantly to staff members' mobile apps. You can target all staff or filter by role and department.
          </div>
        </div>
      </div>

      {/* Compose Form */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          Compose New Announcement
        </h3>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#F87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#34D399', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={18} color="#34D399" />
            <span>{success}</span>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Announcement Title *</label>
          <input className="input-field" style={{ borderRadius: '12px' }} type="text" placeholder="e.g. Mandatory Staff Meeting Tomorrow at 3:00 PM" value={form.title} onChange={e => f('title', e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">Message Content *</label>
          <textarea
            className="input-field"
            style={{ borderRadius: '12px', resize: 'vertical' }}
            rows={5}
            placeholder="Write full announcement details or circular instructions here…"
            value={form.body}
            onChange={e => f('body', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Notification Type</label>
            <select className="input-field" style={{ borderRadius: '12px' }} value={form.type} onChange={e => f('type', e.target.value)}>
              {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Target Role</label>
            <select className="input-field" style={{ borderRadius: '12px' }} value={form.targetRole} onChange={e => f('targetRole', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r === 'All Staff' ? '' : r}>{r}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Target Department</label>
            <select className="input-field" style={{ borderRadius: '12px' }} value={form.targetDepartment} onChange={e => f('targetDepartment', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Live Mobile Push Preview */}
        {(form.title || form.body) && (
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--primary-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={14} /> Mobile Push Notification Preview
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary-500), #4338CA)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <Bell size={18} color="#FFF" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.94rem', marginBottom: '4px' }}>{form.title || 'Announcement Title'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{form.body || 'Message body text will be shown here…'}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                  {form.targetRole && form.targetRole !== 'All Staff' ? `To: ${form.targetRole}` : 'To: All Staff'}
                  {form.targetDepartment && form.targetDepartment !== 'All Departments' ? ` • ${form.targetDepartment}` : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button onClick={handleSend} disabled={isLoading} className="btn btn-primary" style={{ minWidth: '200px', height: '46px', borderRadius: '12px', fontSize: '0.92rem' }}>
            {isLoading ? 'Broadcasting…' : <><Send size={18} /> Broadcast Notice</>}
          </button>
        </div>
      </div>
    </div>
  );
};


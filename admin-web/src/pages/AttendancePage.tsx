import React, { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  Edit2,
  X,
  MapPin,
  Camera,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import apiClient from '../api/client';
import type { AttendanceRecord } from '../types';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  CHECKED_IN: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34D399', label: 'CHECKED IN' },
  CHECKED_OUT: { bg: 'rgba(45, 212, 191, 0.12)', color: '#2DD4BF', label: 'CHECKED OUT' },
  NOT_CHECKED_IN: { bg: 'rgba(251, 146, 60, 0.12)', color: '#FB923C', label: 'NOT CHECKED IN' },
  LATE: { bg: 'rgba(250, 204, 21, 0.12)', color: '#FACC15', label: 'LATE' },
  PRESENT: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34D399', label: 'PRESENT' },
  HALF_DAY: { bg: 'rgba(251, 146, 60, 0.12)', color: '#FB923C', label: 'HALF DAY' },
  ON_LEAVE: { bg: 'rgba(129, 140, 248, 0.12)', color: '#818CF8', label: 'ON LEAVE' },
  ABSENT: { bg: 'rgba(248, 113, 113, 0.12)', color: '#F87171', label: 'ABSENT' },
  HOLIDAY: { bg: 'rgba(192, 132, 252, 0.12)', color: '#C084FC', label: 'HOLIDAY' },
  WEEKEND: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94A3B8', label: 'WEEKEND' },
};

const DEPARTMENTS = [
  'Academics',
  'Administration',
  'Accounts',
  'Library',
  'Lab',
  'Bus Staff',
  'Security',
  'Maintenance',
];

interface AttendanceSummary {
  totalStaff: number;
  presentCount: number;
  checkedInCount: number;
  checkedOutCount: number;
  notCheckedInCount: number;
  lateCount: number;
  absentCount: number;
  onLeaveCount: number;
}

// ── Selfie & GPS Detail Modal ──────────────────────────────
const SelfieModal: React.FC<{ record: AttendanceRecord; onClose: () => void }> = ({ record, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Eye size={18} color="var(--primary-400)" />
          </div>
          <span className="modal-title">Attendance Details — {record.employeeName}</span>
        </div>
        <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
      </div>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            ['Staff Name', record.employeeName],
            ['Employee ID', record.employeeId],
            ['Designation', record.designation || 'Staff'],
            ['Department', record.department || 'General'],
            ['Check-In Time', record.checkInTime || 'Not Checked In Yet'],
            ['Check-Out Time', record.checkOutTime || 'Pending Check-Out'],
            ['Working Duration', record.workingHours || '—'],
            ['Live Status', record.checkInStatus || record.status],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        {(record.checkInLat || record.checkOutLat) && (
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#34D399', fontWeight: 800, fontSize: '0.88rem' }}>
              <MapPin size={16} /> GPS Location Coordinates
            </div>
            {record.checkInLat && <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Check-In GPS: {record.checkInLat?.toFixed(6)}, {record.checkInLon?.toFixed(6)}</div>}
            {record.checkOutLat && <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Check-Out GPS: {record.checkOutLat?.toFixed(6)}, {record.checkOutLon?.toFixed(6)}</div>}
          </div>
        )}

        {(record.checkInSelfieUrl || record.checkOutSelfieUrl) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary-400)', fontWeight: 800, fontSize: '0.88rem' }}>
              <Camera size={16} /> Live Verification Selfies
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {record.checkInSelfieUrl && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Check-In Photo</div>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace(/\/api.*$/, '') || 'http://localhost:5001'}${record.checkInSelfieUrl}`}
                    alt="Check-In Selfie"
                    style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              {record.checkOutSelfieUrl && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Check-Out Photo</div>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace(/\/api.*$/, '') || 'http://localhost:5001'}${record.checkOutSelfieUrl}`}
                    alt="Check-Out Selfie"
                    style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {record.notes && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Notes / Remark</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{record.notes}</div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
);

const PRESET_REASONS = [
  'Phone Battery Empty',
  'Phone Left at Home',
  'Approved by Principal',
  'Network / App Sync Issue',
  'Health / Medical Emergency',
];

// ── Admin Override Modal ───────────────────────────────────
const OverrideModal: React.FC<{ record: AttendanceRecord; date: string; onClose: () => void; onSave: () => void }> = ({ record, date, onClose, onSave }) => {
  const [form, setForm] = useState({
    status: record.status !== 'NOT_CHECKED_IN' ? record.status : 'PRESENT',
    checkInAt: record.rawCheckInAt ? new Date(record.rawCheckInAt).toISOString().slice(0, 16) : `${date}T09:00`,
    checkOutAt: record.rawCheckOutAt ? new Date(record.rawCheckOutAt).toISOString().slice(0, 16) : '',
    notes: record.notes || '',
    isLate: record.isLate || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsLoading(true); setError('');
    try {
      await apiClient.post('/attendance/admin/override', {
        userId: record.userId,
        date,
        status: form.status,
        checkInAt: form.status === 'ABSENT' || form.status === 'NOT_CHECKED_IN' ? null : (form.checkInAt || null),
        checkOutAt: form.status === 'ABSENT' || form.status === 'NOT_CHECKED_IN' ? null : (form.checkOutAt || null),
        notes: form.notes,
        isLate: form.isLate,
      });
      onSave(); onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance override.');
    } finally { setIsLoading(false); }
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit2 size={18} color="#FBBF24" />
            <span className="modal-title">Override Attendance — {record.employeeName}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={20} color="var(--primary-400)" />
            <div>
              <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{record.employeeName} ({record.employeeId})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Date: <strong style={{ color: '#FFF' }}>{date}</strong> • Department: {record.department || 'General'}</div>
            </div>
          </div>

          {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}

          <div className="input-group">
            <label className="input-label">Attendance Status *</label>
            <select className="input-field" value={form.status} onChange={e => f('status', e.target.value)}>
              <option value="PRESENT">PRESENT (On Time)</option>
              <option value="HALF_DAY">HALF DAY</option>
              <option value="ON_LEAVE">ON LEAVE (Paid Leave)</option>
              <option value="ABSENT">ABSENT (Unpaid)</option>
              <option value="HOLIDAY">HOLIDAY</option>
            </select>
          </div>

          {form.status !== 'ABSENT' && form.status !== 'HOLIDAY' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Check-In Time</label>
                <input className="input-field" type="datetime-local" value={form.checkInAt} onChange={e => f('checkInAt', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Check-Out Time (Optional)</label>
                <input className="input-field" type="datetime-local" value={form.checkOutAt} onChange={e => f('checkOutAt', e.target.value)} />
              </div>
            </div>
          )}

          {form.status === 'PRESENT' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <input type="checkbox" checked={form.isLate} onChange={e => f('isLate', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)' }} />
              <span>Mark as Late Arrival</span>
            </label>
          )}

          <div className="input-group">
            <label className="input-label">Reason / Admin Remarks *</label>
            <textarea className="input-field" rows={2} placeholder="Explain why this manual override is being entered…" value={form.notes} onChange={e => f('notes', e.target.value)} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {PRESET_REASONS.map(r => (
                <button key={r} type="button" onClick={() => f('notes', r)} className="btn btn-secondary btn-sm" style={{ padding: '3px 10px', fontSize: '0.74rem', borderRadius: '8px' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
            {isLoading ? 'Saving…' : 'Save Override'}
          </button>
        </div>
      </div>
    </div>
  );
};

const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  PRESENT: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  LATE: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  HALF_DAY: { bg: 'rgba(249, 115, 22, 0.15)', color: '#FB923C', border: 'rgba(249, 115, 22, 0.3)' },
  PAID_LEAVE: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  UNPAID_LEAVE: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  ABSENT: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  HOLIDAY: { bg: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  SUNDAY: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94A3B8', border: 'rgba(100, 116, 139, 0.3)' },
  UPCOMING: { bg: 'rgba(255, 255, 255, 0.02)', color: '#64748B', border: 'rgba(255, 255, 255, 0.05)' },
};

// ── Staff Monthly Calendar Modal ────────────────────────────
const StaffCalendarModal: React.FC<{
  record: AttendanceRecord;
  onClose: () => void;
  onSelectDateForOverride: (dateStr: string) => void;
}> = ({ record, onClose, onSelectDateForOverride }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthSummary = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(
        `/attendance/admin/staff/${record.userId}/month-summary?month=${month}&year=${year}`
      );
      setSummaryData(res.data);
    } catch {
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthSummary();
  }, [record.userId, month, year]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(12px)', zIndex: 999 }}>
      <div className="modal-content" style={{ maxWidth: '800px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>
        
        {/* Header Strip with Staff Profile Info */}
        <div className="modal-header" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(11,15,25,0.95))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-500), #4338CA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800, color: '#FFF',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}>
              {record.employeeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>{record.employeeName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <code style={{ background: 'rgba(99,102,241,0.15)', color: '#C7D2FE', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  ID: {record.employeeId}
                </code>
                <span>•</span>
                <span>{record.designation || 'Staff'}</span>
                <span>•</span>
                <span>{record.department || 'General'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Controls Bar & Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '8px 14px', borderRadius: '12px' }}>
              <Sparkles size={16} color="var(--primary-400)" />
              <span style={{ fontSize: '0.82rem', color: '#C7D2FE', fontWeight: 600 }}>
                Click <strong>ANY DATE CELL</strong> below to override/mark attendance.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select className="input-field" style={{ width: 'auto', padding: '6px 28px 6px 12px', fontWeight: 700, borderRadius: '10px' }} value={month} onChange={e => setMonth(Number(e.target.value))}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select className="input-field" style={{ width: 'auto', padding: '6px 28px 6px 12px', fontWeight: 700, borderRadius: '10px' }} value={year} onChange={e => setYear(Number(e.target.value))}>
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats Strip */}
          {summaryData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Present Days</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>{summaryData.counts.presentDays} Days</div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Late Days</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FACC15', marginTop: '2px' }}>{summaryData.counts.lateDays} Days</div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Paid Leaves</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818CF8', marginTop: '2px' }}>{summaryData.counts.paidLeaveDays} Days</div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Unpaid / Absences</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>{summaryData.calculated.effectiveUnpaidDays} Days</div>
              </div>
            </div>
          )}

          {/* Monthly Calendar Grid */}
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading monthly attendance calendar…</div>
          ) : !summaryData ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>Failed to load monthly calendar.</div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ height: '68px', borderRadius: '12px', opacity: 0.15, background: 'rgba(255,255,255,0.02)' }} />
                ))}

                {summaryData.calendar?.map((item: any) => {
                  const style = STATUS_BADGE_STYLE[item.status] || STATUS_BADGE_STYLE.UPCOMING;
                  const isToday = item.date === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={item.day}
                      onClick={() => onSelectDateForOverride(item.date)}
                      title={`Click to mark/override attendance for ${item.date}`}
                      style={{
                        height: '68px',
                        borderRadius: '12px',
                        backgroundColor: style.bg,
                        border: isToday ? '2px solid #6366F1' : `1px solid ${style.border}`,
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isToday ? '0 0 16px rgba(99,102,241,0.45)' : 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                        e.currentTarget.style.borderColor = 'var(--primary-400)';
                        e.currentTarget.style.boxShadow = '0 8px 22px rgba(99, 102, 241, 0.35)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1.0)';
                        e.currentTarget.style.borderColor = isToday ? '#6366F1' : style.border;
                        e.currentTarget.style.boxShadow = isToday ? '0 0 16px rgba(99,102,241,0.45)' : 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFF' }}>{item.day}</span>
                        {isToday && <span style={{ fontSize: '0.55rem', backgroundColor: '#6366F1', color: '#FFF', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>TODAY</span>}
                      </div>

                      <div style={{ fontSize: '0.64rem', fontWeight: 800, color: style.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {item.status.replace('_LEAVE', '').replace('_', ' ')}
                      </div>

                      {item.note && (
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Color Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34D399' }} /> Present
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FACC15' }} /> Late
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FB923C' }} /> Half Day
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#818CF8' }} /> Paid Leave
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F87171' }} /> Absent
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C084FC' }} /> Holiday
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94A3B8' }} /> Sunday
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 26px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ─────────────────────────────────────
export const AttendancePage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [date, setDate] = useState(todayStr);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [activeChip, setActiveChip] = useState<string>('ALL');

  // Modals
  const [viewRecord, setViewRecord] = useState<AttendanceRecord | null>(null);
  const [overrideRecord, setOverrideRecord] = useState<AttendanceRecord | null>(null);
  const [overrideDate, setOverrideDate] = useState<string>(todayStr);
  const [calendarRecord, setCalendarRecord] = useState<AttendanceRecord | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (search) params.set('search', search);
      if (department) params.set('department', department);
      if (activeChip !== 'ALL') params.set('status', activeChip);

      const res: any = await apiClient.get(`/attendance/admin/all?${params.toString()}`);
      setRecords(res.data?.records || []);
      setTotal(res.data?.total || 0);
      setSummary(res.data?.summary || null);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [date, search, department, activeChip]);

  const chips = [
    { id: 'ALL', label: 'All Staff', count: summary?.totalStaff || total },
    { id: 'CHECKED_IN', label: 'Checked In Today', count: summary?.checkedInCount || 0, color: '#34D399' },
    { id: 'CHECKED_OUT', label: 'Checked Out', count: summary?.checkedOutCount || 0, color: '#2DD4BF' },
    { id: 'NOT_CHECKED_IN', label: 'Not Checked In Yet', count: summary?.notCheckedInCount || 0, color: '#FB923C' },
    { id: 'LATE', label: 'Late', count: summary?.lateCount || 0, color: '#FACC15' },
    { id: 'ON_LEAVE', label: 'On Leave', count: summary?.onLeaveCount || 0, color: '#818CF8' },
    { id: 'ABSENT', label: 'Absent', count: summary?.absentCount || 0, color: '#F87171' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Overview Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px', borderTop: '2px solid var(--primary-500)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Active Staff</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{summary?.totalStaff || 0}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderTop: '2px solid var(--emerald-500)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checked In</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34D399', marginTop: '4px' }}>{summary?.checkedInCount || 0}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderTop: '2px solid var(--sky-500)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checked Out</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38BDF8', marginTop: '4px' }}>{summary?.checkedOutCount || 0}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderTop: '2px solid var(--amber-500)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Checked In</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FBBF24', marginTop: '4px' }}>{summary?.notCheckedInCount || 0}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderTop: '2px solid var(--rose-500)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Late Check-Ins</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F87171', marginTop: '4px' }}>{summary?.lateCount || 0}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Calendar size={16} style={{ color: 'var(--primary-500)' }} />
          <input
            type="date"
            className="input-field"
            style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, padding: 0 }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '40px' }}
            type="text"
            placeholder="Search by staff name, ID, or designation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="input-field" style={{ width: 'auto' }} value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Status Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {chips.map(chip => {
          const isActive = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFF' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-600)' : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{chip.label}</span>
              <span style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                color: chip.color && !isActive ? chip.color : '#FFF',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Staff Attendance Data Table */}
      <div className="data-table-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading live attendance data…</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No staff attendance records matching filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '950px' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Staff Member</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Employee ID</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Check In</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Check Out</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Working Hours</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Live Status</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Selfie</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const statusStyle = STATUS_COLORS[r.checkInStatus || r.status] || STATUS_COLORS.NOT_CHECKED_IN;
                  const displayWorkingHours = r.workingHours && r.workingHours !== 'Oh Om' && r.workingHours !== '0h 0m' ? r.workingHours : '—';
                  return (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary-500), #4338CA)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 800, color: '#FFF', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
                          }}>
                            {r.employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.employeeName}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>{r.designation || 'Staff'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: '#C7D2FE', background: 'rgba(99,102,241,0.12)', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.25)' }}>
                          {r.employeeId}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.department || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.checkInTime ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#34D399', fontWeight: 800, fontSize: '0.9rem' }}>{r.checkInTime}</span>
                            {r.isLate && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(250,204,21,0.15)', color: '#FACC15', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, border: '1px solid rgba(250,204,21,0.3)' }}>
                                LATE
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#FB923C', fontSize: '0.82rem', fontWeight: 600 }}>Not Checked In</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.checkOutTime ? (
                          <span style={{ color: '#2DD4BF', fontWeight: 800, fontSize: '0.9rem' }}>{r.checkOutTime}</span>
                        ) : r.checkInTime ? (
                          <span style={{ color: '#818CF8', fontSize: '0.82rem', fontWeight: 600 }}>Pending Check-Out</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {displayWorkingHours}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.color}40`,
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.4px',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.checkInSelfieUrl ? (
                          <span style={{ color: '#34D399', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} /> Selfie
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => setViewRecord(r)}
                            className="btn btn-secondary btn-icon btn-sm"
                            title="View Details"
                            style={{ borderRadius: '10px' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setOverrideRecord(r);
                              setOverrideDate(date);
                            }}
                            className="btn btn-icon btn-sm"
                            title="Override / Mark Attendance"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px' }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setCalendarRecord(r)}
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Open Monthly Attendance Calendar"
                            style={{ color: 'var(--primary-400)', borderRadius: '10px' }}
                          >
                            <Calendar size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewRecord && <SelfieModal record={viewRecord} onClose={() => setViewRecord(null)} />}
      {overrideRecord && (
        <OverrideModal
          record={overrideRecord}
          date={overrideDate}
          onClose={() => setOverrideRecord(null)}
          onSave={fetchRecords}
        />
      )}
      {calendarRecord && (
        <StaffCalendarModal
          record={calendarRecord}
          onClose={() => setCalendarRecord(null)}
          onSelectDateForOverride={(selectedDateStr) => {
            setOverrideRecord(calendarRecord);
            setOverrideDate(selectedDateStr);
          }}
        />
      )}
    </div>
  );
};

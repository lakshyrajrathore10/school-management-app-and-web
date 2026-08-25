import React, { useEffect, useState } from 'react';
import { Search, MessageSquare, CheckCircle, XCircle, X, Calendar, Save, Check } from 'lucide-react';
import apiClient from '../api/client';
import type { LeaveRequest } from '../types';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
type StatusTab = typeof STATUS_TABS[number];

const StatusBadgeClass: Record<string, string> = {
  PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', CANCELLED: 'badge-inactive',
};

const getLeaveTypeStyle = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('sick')) return { bg: 'rgba(239, 68, 68, 0.12)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' };
  if (t.includes('casual')) return { bg: 'rgba(245, 158, 11, 0.12)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };
  return { bg: 'rgba(99, 102, 241, 0.12)', color: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' };
};

// ── Review Modal ────────────────────────────────────────────
const ReviewModal: React.FC<{
  leave: LeaveRequest;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSave: () => void;
}> = ({ leave, action, onClose, onSave }) => {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true); setError('');
    try {
      await apiClient.patch(`/leaves/${leave.id}/${action}`, { comment });
      onSave(); onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to ${action} leave.`);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: action === 'approve' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {action === 'approve' ? <CheckCircle size={18} color="#34D399" /> : <XCircle size={18} color="#F87171" />}
            </div>
            <span className="modal-title" style={{ color: action === 'approve' ? '#34D399' : '#F87171' }}>
              {action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{leave.employeeName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{leave.type}</span>
              <span>•</span>
              <span>{leave.fromDate} – {leave.toDate} ({leave.days} day{leave.days !== 1 ? 's' : ''})</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', background: 'rgba(15,23,42,0.5)', padding: '10px 12px', borderRadius: '8px' }}>
              "{leave.reason}"
            </div>
          </div>
          {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}
          <div className="input-group">
            <label className="input-label">Comment / Remark (Optional)</label>
            <textarea className="input-field" rows={3} placeholder="Add a reason or note for the staff member…" value={comment} onChange={e => setComment(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
          >
            {isLoading ? 'Processing…' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────
export const LeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('PENDING');
  const [search, setSearch] = useState('');
  const [reviewTarget, setReviewTarget] = useState<{ leave: LeaveRequest; action: 'approve' | 'reject' } | null>(null);

  // Monthly Paid Leave Quota Configuration State
  const [monthlyPaidLeaves, setMonthlyPaidLeaves] = useState<number>(2);
  const [isSavingQuota, setIsSavingQuota] = useState(false);
  const [quotaSuccess, setQuotaSuccess] = useState('');

  // Fetch Current School Config for Paid Leave Quota
  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const res: any = await apiClient.get('/schools/config');
        if (res.data?.monthlyPaidLeaves !== undefined) {
          setMonthlyPaidLeaves(res.data.monthlyPaidLeaves);
        }
      } catch {}
    };
    fetchQuota();
  }, []);

  const handleSaveQuota = async () => {
    setIsSavingQuota(true); setQuotaSuccess('');
    try {
      await apiClient.patch('/schools/config', { monthlyPaidLeaves: Number(monthlyPaidLeaves) });
      setQuotaSuccess(`Monthly Paid Leave Quota updated to ${monthlyPaidLeaves} days/month!`);
      setTimeout(() => setQuotaSuccess(''), 4000);
    } catch {
      alert('Failed to update Paid Leave Quota.');
    } finally {
      setIsSavingQuota(false);
    }
  };

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (search) params.set('search', search);
      const res: any = await apiClient.get(`/leaves/admin/all?${params.toString()}`);
      setLeaves(res.data?.leaves || []);
      setTotal(res.data?.total || 0);
    } catch { }
    setIsLoading(false);
  };

  useEffect(() => { fetchLeaves(); }, [activeTab, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Monthly Paid Leave Quota Card */}
      <div className="card" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        borderLeft: '3px solid var(--purple-500)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            backgroundColor: 'var(--purple-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#C084FC',
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              Monthly Paid Leave Quota
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Set monthly paid leaves allowed per staff member (syncs live with Mobile App).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-input)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Leaves / Month:</label>
            <input
              type="number"
              className="input-field"
              min={0}
              max={15}
              value={monthlyPaidLeaves}
              onChange={e => setMonthlyPaidLeaves(parseInt(e.target.value) || 0)}
              style={{ width: '60px', textAlign: 'center', fontWeight: 700, fontSize: '0.92rem', padding: '4px' }}
            />
          </div>

          <button
            onClick={handleSaveQuota}
            disabled={isSavingQuota}
            className="btn btn-primary"
            style={{ backgroundColor: '#7C3AED' }}
          >
            {isSavingQuota ? 'Saving…' : <><Save size={15} /> Save Quota</>}
          </button>
        </div>

        {quotaSuccess && (
          <div style={{ width: '100%', fontSize: '0.82rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-4px' }}>
            <Check size={16} color="#34D399" />
            <span>{quotaSuccess}</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="btn"
                style={{
                  backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '40px' }}
            type="text"
            placeholder="Search staff name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>Showing</span>
        <strong style={{ color: '#FFF', fontWeight: 800 }}>{total}</strong>
        <span>leave request{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading leave requests…</div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No leave requests found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const typeStyle = getLeaveTypeStyle(leave.type);
                return (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-400)'
                        }}>
                          {leave.employeeName?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{leave.employeeName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>{leave.employeeId} • {leave.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                        {leave.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem' }}>{leave.fromDate}</td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem' }}>{leave.toDate}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9rem' }}>{leave.days}d</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{leave.appliedOn}</td>
                    <td><span className={`badge ${StatusBadgeClass[leave.status] || 'badge-inactive'}`}>{leave.status}</span></td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                        {leave.reason}
                      </div>
                      {leave.remarks && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={11} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.remarks}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {leave.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setReviewTarget({ leave, action: 'approve' })}
                            className="btn btn-icon btn-sm"
                            title="Approve Leave"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setReviewTarget({ leave, action: 'reject' })}
                            className="btn btn-icon btn-sm"
                            title="Reject Leave"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {leave.status !== 'PENDING' && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {leave.reviewedBy ? `By ${leave.reviewedBy}` : '—'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          leave={reviewTarget.leave}
          action={reviewTarget.action}
          onClose={() => setReviewTarget(null)}
          onSave={fetchLeaves}
        />
      )}
    </div>
  );
};


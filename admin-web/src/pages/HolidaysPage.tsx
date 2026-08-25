import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Calendar } from 'lucide-react';
import apiClient from '../api/client';
import type { Holiday } from '../types';

const HOLIDAY_TYPES = ['National', 'Festival', 'School', 'Vacation'];
const TYPE_COLORS: Record<string, string> = {
  National: 'badge-absent', Festival: 'badge-late', School: 'badge-approved', Vacation: 'badge-pending',
};

// ── Add / Edit Modal ────────────────────────────────────────
const HolidayModal: React.FC<{
  holiday?: Holiday | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ holiday, onClose, onSave }) => {
  const isEdit = !!holiday;
  const [form, setForm] = useState({
    name: holiday?.name || '',
    startDate: holiday?.rawStartDate || '',
    endDate: holiday?.rawEndDate || holiday?.rawStartDate || '',
    type: holiday?.type || 'Festival',
    description: holiday?.description || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate) { setError('Name and start date are required.'); return; }
    setIsLoading(true); setError('');
    try {
      if (isEdit) {
        await apiClient.patch(`/holidays/${holiday!.id}`, form);
      } else {
        await apiClient.post('/holidays', form);
      }
      onSave(); onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save holiday.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar size={18} color="var(--primary-400)" />
            </div>
            <span className="modal-title">{isEdit ? 'Edit Holiday' : 'Add New Holiday'}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}
          <div className="input-group">
            <label className="input-label">Holiday Name *</label>
            <input className="input-field" type="text" placeholder="e.g. Republic Day, Diwali" value={form.name} onChange={e => f('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Start Date *</label>
              <input className="input-field" type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">End Date (If Multi-Day)</label>
              <input className="input-field" type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Holiday Category</label>
            <select className="input-field" value={form.type} onChange={e => f('type', e.target.value)}>
              {HOLIDAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Description (Optional)</label>
            <textarea className="input-field" rows={2} placeholder="Add a short note or description for staff…" value={form.description} onChange={e => f('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Saving…' : isEdit ? 'Update Holiday' : 'Add Holiday'}</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────
export const HolidaysPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/holidays');
      setHolidays(res.data || []);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/holidays/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchHolidays();
    } catch {}
    setDeleteLoading(false);
  };

  const grouped = holidays.reduce<Record<string, Holiday[]>>((acc, h) => {
    const type = h.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(h);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Total</span>
          <strong style={{ color: '#FFF', fontWeight: 800 }}>{holidays.length}</strong>
          <span>school holidays configured</span>
        </div>
        <button className="btn btn-primary" style={{ borderRadius: '12px' }} onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Add Holiday
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading holidays…</div>
      ) : holidays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No holidays added yet. Click "Add Holiday" to get started.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${TYPE_COLORS[type] || 'badge-inactive'}`}>{type}</span>
                <span>Holidays ({items.length})</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px' }}>
                {items.map(h => (
                  <div key={h.id} className="card card-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '-0.2px' }}>{h.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--primary-400)', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          <span>{h.date} • {h.day}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => setEditHoliday(h)} className="btn btn-secondary btn-icon btn-sm" title="Edit Holiday" style={{ borderRadius: '10px' }}><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(h)} className="btn btn-icon btn-sm" title="Delete Holiday" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {h.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px' }}>{h.description}</div>}
                    <span className={`badge ${TYPE_COLORS[h.type] || 'badge-inactive'}`} style={{ alignSelf: 'flex-start' }}>{h.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <HolidayModal onClose={() => setShowAdd(false)} onSave={fetchHolidays} />}
      {editHoliday && <HolidayModal holiday={editHoliday} onClose={() => setEditHoliday(null)} onSave={fetchHolidays} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#F87171' }}>Confirm Delete</span>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: '#FFF' }}>{deleteTarget.name}</strong> ({deleteTarget.date})?
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger">{deleteLoading ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Save, MapPin, Clock, Navigation, Shield, CheckCircle2, Info } from 'lucide-react';
import apiClient from '../api/client';
import type { SchoolConfig } from '../types';
import { LocationPickerMap } from '../components/LocationPickerMap';

export const SettingsPage: React.FC = () => {
  const [form, setForm] = useState<Partial<SchoolConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const res: any = await apiClient.get('/schools/config');
        const configData = res?.data || res?.school || res || {};
        setForm({
          schoolName: configData.schoolName || 'Saint Xavier Senior Secondary School',
          schoolCode: configData.schoolCode || 'SCH-001',
          timezone: configData.timezone || 'Asia/Kolkata',
          latitude: configData.latitude ?? 28.6139,
          longitude: configData.longitude ?? 77.2090,
          allowedRadiusMeters: configData.allowedRadiusMeters ?? 150,
          shiftStartTime: configData.shiftStartTime || '09:00',
          shiftEndTime: configData.shiftEndTime || '17:00',
          graceMinutes: configData.graceMinutes ?? 15,
          latePenaltyMode: configData.latePenaltyMode || 'PER_MINUTE',
          latePenaltyPerMinute: configData.latePenaltyPerMinute ?? 5,
          latePenaltyPerDay: configData.latePenaltyPerDay ?? 100,
          lateDaysForHalfDayCut: configData.lateDaysForHalfDayCut ?? 3,
        });
      } catch (err: any) {
        setForm({
          schoolName: 'Saint Xavier Senior Secondary School',
          schoolCode: 'SCH-001',
          timezone: 'Asia/Kolkata',
          latitude: 28.6139,
          longitude: 77.2090,
          allowedRadiusMeters: 150,
          shiftStartTime: '09:00',
          shiftEndTime: '17:00',
          graceMinutes: 15,
          latePenaltyMode: 'PER_MINUTE',
          latePenaltyPerMinute: 5,
          latePenaltyPerDay: 100,
          lateDaysForHalfDayCut: 3,
        });
      }
      setIsLoading(false);
    };
    fetchConfig();
  }, []);

  const f = (k: keyof SchoolConfig, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setIsSaving(true); setError(''); setSuccess('');
    try {
      const payload: any = {
        schoolName: form.schoolName,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        allowedRadiusMeters: Number(form.allowedRadiusMeters),
        shiftStartTime: form.shiftStartTime,
        shiftEndTime: form.shiftEndTime,
        graceMinutes: Number(form.graceMinutes),
        latePenaltyMode: form.latePenaltyMode || 'PER_MINUTE',
        latePenaltyPerMinute: Number(form.latePenaltyPerMinute ?? 5),
        latePenaltyPerDay: Number(form.latePenaltyPerDay ?? 100),
        lateDaysForHalfDayCut: Number(form.lateDaysForHalfDayCut ?? 3),
        timezone: form.timezone,
      };
      const res: any = await apiClient.patch('/schools/config', payload);
      setForm(res.data);
      setSuccess('School configuration saved successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentMode = form.latePenaltyMode || 'PER_MINUTE';
  const perMinRate = form.latePenaltyPerMinute ?? 5;
  const perDayRate = form.latePenaltyPerDay ?? 100;
  const nLatesCut = form.lateDaysForHalfDayCut ?? 3;

  return (
    <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', padding: '14px 18px', color: '#F87171', fontSize: '0.9rem' }}>{error}</div>}
      {success && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '14px 18px', color: '#34D399', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#34D399" />
          <span>{success}</span>
        </div>
      )}

      {/* School Info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={20} color="var(--primary-400)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>School Profile Information</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Basic school identity and system regional settings</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">School Name *</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="text" value={form.schoolName || ''} onChange={e => f('schoolName', e.target.value)} placeholder="e.g. St. Xavier Senior Secondary School" />
          </div>
          <div className="input-group">
            <label className="input-label">School Code (Unique ID)</label>
            <input className="input-field" style={{ borderRadius: '12px', opacity: 0.6, cursor: 'not-allowed' }} type="text" value={form.schoolCode || ''} disabled />
          </div>
          <div className="input-group">
            <label className="input-label">System Timezone</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="text" value={form.timezone || ''} onChange={e => f('timezone', e.target.value)} placeholder="e.g. Asia/Kolkata" />
          </div>
        </div>
      </div>

      {/* GPS Geofence */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={20} color="#34D399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>GPS Geofence & Location Boundaries</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Pick your campus position on the map. Staff check-in requests outside this radius will be flagged.</p>
          </div>
        </div>

        {/* Leaflet Interactive Map Picker */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <LocationPickerMap
            latitude={form.latitude ?? 28.6139}
            longitude={form.longitude ?? 77.2090}
            radiusMeters={form.allowedRadiusMeters ?? 150}
            onChange={(newLat, newLng) => {
              setForm(prev => ({ ...prev, latitude: newLat, longitude: newLng }));
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Latitude Coordinates</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="number" step="0.000001" value={form.latitude ?? ''} onChange={e => f('latitude', parseFloat(e.target.value))} placeholder="e.g. 28.644800" />
          </div>
          <div className="input-group">
            <label className="input-label">Longitude Coordinates</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="number" step="0.000001" value={form.longitude ?? ''} onChange={e => f('longitude', parseFloat(e.target.value))} placeholder="e.g. 77.216721" />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Allowed Check-In Geofence Radius</span>
              <strong style={{ color: '#34D399' }}>{form.allowedRadiusMeters ?? 150} Meters</strong>
            </label>
            <input className="input-field" type="range" min={30} max={500} step={5} value={form.allowedRadiusMeters ?? 150} onChange={e => f('allowedRadiusMeters', parseInt(e.target.value))} style={{ background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>30m (Very Strict)</span>
              <span>150m (Recommended)</span>
              <span>500m (Flexible)</span>
            </div>
          </div>
        </div>
        {form.latitude && form.longitude && (
          <a
            href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-start', borderRadius: '10px' }}
          >
            <MapPin size={14} /> Open in Google Maps
          </a>
        )}
      </div>

      {/* Shift Timings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={20} color="#FBBF24" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Daily Shift Timings & Grace Period</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set official working hours and allowed arrival grace minutes</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Shift Start Time</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="time" value={form.shiftStartTime || ''} onChange={e => f('shiftStartTime', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Shift End Time</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="time" value={form.shiftEndTime || ''} onChange={e => f('shiftEndTime', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Grace Period (Minutes)</label>
            <input className="input-field" style={{ borderRadius: '12px' }} type="number" min={0} max={60} value={form.graceMinutes ?? 15} onChange={e => f('graceMinutes', parseInt(e.target.value))} placeholder="e.g. 15" />
          </div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          ⚠️ Staff checking in after <strong style={{ color: '#FBBF24' }}>{form.shiftStartTime} + {form.graceMinutes} minutes</strong> will be automatically tagged as <strong style={{ color: '#FBBF24' }}>LATE</strong>.
        </div>
      </div>

      {/* Late Penalty Formula Settings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.25)', background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(15,23,42,0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="#F87171" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Automated Salary Late Penalty Rule</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Configure how monetary deductions for late check-ins are calculated in monthly pay slips.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ gridColumn: currentMode === 'DISABLED' ? '1 / -1' : undefined }}>
            <label className="input-label">Penalty Rule Mode</label>
            <select
              className="input-field"
              style={{ borderRadius: '12px', fontWeight: 700 }}
              value={currentMode}
              onChange={e => f('latePenaltyMode', e.target.value)}
            >
              <option value="PER_MINUTE">Per Minute Fine (Late Mins × ₹ Rate)</option>
              <option value="PER_LATE_DAY">Flat Fine per Late Day (Late Days × ₹ Amount)</option>
              <option value="HALF_DAY_AFTER_N_LATES">Half-Day Salary Cut after N Late Days</option>
              <option value="DISABLED">Disabled (Manual Fine Input)</option>
            </select>
          </div>

          {currentMode === 'PER_MINUTE' && (
            <div className="input-group">
              <label className="input-label">Fine Rate per Late Minute (₹)</label>
              <input
                className="input-field"
                style={{ borderRadius: '12px' }}
                type="number"
                min={1}
                max={500}
                value={perMinRate}
                onChange={e => f('latePenaltyPerMinute', Number(e.target.value))}
                placeholder="e.g. 5"
              />
            </div>
          )}

          {currentMode === 'PER_LATE_DAY' && (
            <div className="input-group">
              <label className="input-label">Flat Fine per Late Day (₹)</label>
              <input
                className="input-field"
                style={{ borderRadius: '12px' }}
                type="number"
                min={1}
                max={5000}
                value={perDayRate}
                onChange={e => f('latePenaltyPerDay', Number(e.target.value))}
                placeholder="e.g. 100"
              />
            </div>
          )}

          {currentMode === 'HALF_DAY_AFTER_N_LATES' && (
            <div className="input-group">
              <label className="input-label">Number of Late Days for 1 Half-Day Cut</label>
              <input
                className="input-field"
                style={{ borderRadius: '12px' }}
                type="number"
                min={1}
                max={30}
                value={nLatesCut}
                onChange={e => f('lateDaysForHalfDayCut', Number(e.target.value))}
                placeholder="e.g. 3"
              />
            </div>
          )}
        </div>

        {/* Informative Formula Banner */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Info size={16} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            {currentMode === 'PER_MINUTE' && (
              <><strong>Formula Active:</strong> Staff arriving after {form.shiftStartTime || '09:00'} + {form.graceMinutes ?? 15} mins grace will be fined <strong style={{ color: '#F87171' }}>₹{perMinRate} per minute</strong> of delay. (e.g. 20 mins late = 20 × ₹{perMinRate} = <strong style={{ color: '#F87171' }}>₹{20 * perMinRate}</strong> fine)</>
            )}
            {currentMode === 'PER_LATE_DAY' && (
              <><strong>Formula Active:</strong> Each late day incurs a flat fine of <strong style={{ color: '#F87171' }}>₹{perDayRate}</strong>. (e.g. 4 late days in a month = 4 × ₹{perDayRate} = <strong style={{ color: '#F87171' }}>₹{4 * perDayRate}</strong> fine)</>
            )}
            {currentMode === 'HALF_DAY_AFTER_N_LATES' && (
              <><strong>Formula Active:</strong> Every <strong style={{ color: '#F87171' }}>{nLatesCut} late days</strong> in a month automatically triggers <strong style={{ color: '#F87171' }}>1 Half-Day salary cut</strong> (0.5 × daily rate).</>
            )}
            {currentMode === 'DISABLED' && (
              <><strong>Auto Penalty Disabled:</strong> System will not auto-calculate late penalty. Admin can still enter fine manually on individual salary slips.</>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ minWidth: '220px', height: '48px', borderRadius: '12px', fontSize: '0.92rem' }}>
          {isSaving ? 'Saving Changes…' : <><Save size={18} /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
};


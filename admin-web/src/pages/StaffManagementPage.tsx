import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Key, KeyRound, Trash2, X, Copy, Check, UserCheck, UserX, Eye, EyeOff, Users, CheckCircle2, Lock, Info } from 'lucide-react';
import apiClient from '../api/client';
import type { StaffMember, Role } from '../types';

const DEPARTMENTS = ['Academics', 'Administration', 'Accounts', 'Library', 'Lab', 'Bus Staff', 'Security', 'Maintenance', 'General'];
const DESIGNATIONS = ['Teacher', 'Principal', 'Vice Principal', 'Receptionist', 'Accountant', 'Lab Assistant', 'Librarian', 'Bus Driver', 'Guard', 'Peon', 'Office Staff'];
const ROLES: { value: Role; label: string }[] = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'HR', label: 'HR' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

// ── Modal: Add / Edit Staff ─────────────────────────────────
const StaffModal: React.FC<{
  staff?: StaffMember | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ staff, onClose, onSave }) => {
  const isEdit = !!staff;
  const [form, setForm] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    employeeId: staff?.employeeId || '',
    designation: staff?.designation || '',
    department: staff?.department || '',
    role: (staff?.role || 'STAFF') as Role,
    baseSalary: staff?.baseSalary || 0,
    bankName: staff?.bankDetails?.bankName || '',
    accountNumber: staff?.bankDetails?.accountNumber || '',
    ifscCode: staff?.bankDetails?.ifscCode || '',
    upiId: staff?.bankDetails?.upiId || '',
    panNumber: staff?.bankDetails?.panNumber || '',
    password: '',
    isActive: staff?.isActive !== false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ employeeId: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showResultPassword, setShowResultPassword] = useState(true);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Full name is required.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const bankDetails = {
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        upiId: form.upiId,
        panNumber: form.panNumber,
      };

      if (isEdit) {
        await apiClient.patch(`/staff/${staff!.id}`, {
          name: form.name, email: form.email, phone: form.phone,
          designation: form.designation, department: form.department,
          role: form.role, baseSalary: Number(form.baseSalary) || 0,
          bankDetails,
          isActive: form.isActive,
        });
        onSave();
        onClose();
      } else {
        const res: any = await apiClient.post('/staff', {
          name: form.name, email: form.email, phone: form.phone,
          employeeId: form.employeeId || undefined,
          designation: form.designation, department: form.department,
          role: form.role, baseSalary: Number(form.baseSalary) || 0,
          bankDetails,
          password: form.password || undefined,
        });
        setCredentials({ employeeId: res.data.employeeId, password: res.data.generatedPassword });
        onSave();
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Employee ID: ${credentials.employeeId}\nPassword: ${credentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const f = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color="var(--primary-400)" />
            </div>
            <span className="modal-title">{isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#F87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {credentials ? (
            <div>
              <p style={{ color: '#34D399', fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> Staff member created successfully!
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px' }}>
                Share these credentials with the staff member. They will use these to log into the mobile app.
              </p>
              <div className="credentials-box">
                <div className="credentials-row">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Employee ID</span>
                  <span style={{ color: '#FFF', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{credentials.employeeId}</span>
                </div>
                <div className="credentials-row" style={{ alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Password</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#FFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {showResultPassword ? credentials.password : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowResultPassword(!showResultPassword)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title={showResultPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showResultPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ marginTop: '16px', width: '100%' }}>
                {copied ? <><Check size={16} /> Copied Credentials!</> : <><Copy size={16} /> Copy Credentials</>}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Full Name *</label>
                  <input className="input-field" type="text" placeholder="Staff member's full name" value={form.name} onChange={e => f('name', e.target.value)} />
                </div>
                {!isEdit && (
                  <div className="input-group">
                    <label className="input-label">Employee ID (Optional — Auto-generated)</label>
                    <input className="input-field" type="text" placeholder="e.g. EMP-0042" value={form.employeeId} onChange={e => f('employeeId', e.target.value)} />
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input className="input-field" type="email" placeholder="staff@school.com" value={form.email} onChange={e => f('email', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input-field" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => f('phone', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Designation</label>
                  <select className="input-field" value={form.designation} onChange={e => f('designation', e.target.value)}>
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select className="input-field" value={form.department} onChange={e => f('department', e.target.value)}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">System Role</label>
                  <select className="input-field" value={form.role} onChange={e => f('role', e.target.value as Role)}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Base Monthly Salary (₹)</label>
                  <input className="input-field" type="number" min="0" placeholder="e.g. 35000" value={form.baseSalary} onChange={e => f('baseSalary', e.target.value)} />
                </div>
                {!isEdit && (
                  <div className="input-group">
                    <label className="input-label">Password (Optional — Auto-generated if blank)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        type={showFormPassword ? 'text' : 'password'}
                        placeholder="Custom password (optional)"
                        value={form.password}
                        onChange={e => f('password', e.target.value)}
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {/* Bank Account Details Section */}
                <div style={{ gridColumn: '1 / -1', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Bank Account & Salary Payout Details
                  </span>
                </div>
                <div className="input-group">
                  <label className="input-label">Bank Name</label>
                  <input className="input-field" type="text" placeholder="e.g. HDFC Bank, SBI" value={form.bankName} onChange={e => f('bankName', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Account Number</label>
                  <input className="input-field" type="text" placeholder="e.g. 501002345678" value={form.accountNumber} onChange={e => f('accountNumber', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">IFSC Code</label>
                  <input className="input-field" type="text" placeholder="e.g. HDFC0001234" value={form.ifscCode} onChange={e => f('ifscCode', e.target.value.toUpperCase())} />
                </div>
                <div className="input-group">
                  <label className="input-label">UPI ID / PAN</label>
                  <input className="input-field" type="text" placeholder="e.g. 9876543210@upi" value={form.upiId} onChange={e => f('upiId', e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            {credentials ? 'Done' : 'Cancel'}
          </button>
          {!credentials && (
            <button onClick={handleSave} disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving…' : isEdit ? 'Update Staff' : 'Create Staff Member'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Modal: Reset Password ───────────────────────────────────
const ResetPasswordModal: React.FC<{
  staff: StaffMember;
  onClose: () => void;
}> = ({ staff, onClose }) => {
  const [customPassword, setCustomPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ employeeId: string; newPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showInputPassword, setShowInputPassword] = useState(false);
  const [showResultPassword, setShowResultPassword] = useState(true);

  const handleReset = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res: any = await apiClient.post(`/staff/${staff.id}/reset-password`, { password: customPassword || undefined });
      setResult({ employeeId: res.data.employeeId, newPassword: res.data.newPassword });
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Employee ID: ${result.employeeId}\nNew Password: ${result.newPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Reset Password — {staff.name}</span>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}
          {result ? (
            <div>
              <p style={{ color: '#34D399', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Password reset successfully!
              </p>
              <div className="credentials-box">
                <div className="credentials-row">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Employee ID</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFF' }}>{result.employeeId}</span>
                </div>
                <div className="credentials-row" style={{ alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>New Password</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFF' }}>
                      {showResultPassword ? result.newPassword : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowResultPassword(!showResultPassword)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title={showResultPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showResultPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ marginTop: '16px', width: '100%' }}>
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy New Credentials</>}
              </button>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">New Password (leave blank to auto-generate)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showInputPassword ? 'text' : 'password'}
                  placeholder="Custom new password (optional)"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowInputPassword(!showInputPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showInputPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">{result ? 'Done' : 'Cancel'}</button>
          {!result && <button onClick={handleReset} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Resetting…' : 'Reset Password'}</button>}
        </div>
      </div>
    </div>
  );
};

// ── Modal: View Credentials ─────────────────────────────────
const ViewCredentialsModal: React.FC<{
  staff: StaffMember;
  onClose: () => void;
}> = ({ staff, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [resetResult, setResetResult] = useState<{ employeeId: string; newPassword: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    setIsResetting(true);
    setError('');
    try {
      const res: any = await apiClient.post(`/staff/${staff.id}/reset-password`, {});
      setResetResult({ employeeId: res.data.employeeId, newPassword: res.data.newPassword });
      setShowPassword(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyDetails = () => {
    const pwdText = resetResult ? `\nPassword: ${resetResult.newPassword}` : '';
    const text = `Staff Member: ${staff.name}\nEmployee ID: ${staff.employeeId}\nRole: ${staff.role}\nDepartment: ${staff.department || 'N/A'}${pwdText}\n\nLogin URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={18} color="var(--primary-400)" />
            <span className="modal-title">Staff Credentials — {staff.name}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Member Card Summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-500), #4338CA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#FFF', fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
            }}>
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>{staff.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {staff.designation || 'Staff'} • {staff.department || 'General'}
              </div>
            </div>
            <span className={`badge ${staff.isActive ? 'badge-present' : 'badge-inactive'}`}>
              {staff.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Credentials Box */}
          <div className="credentials-box">
            <div className="credentials-row">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Employee ID</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#C7D2FE' }}>
                {staff.employeeId}
              </code>
            </div>
            <div className="credentials-row">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address</span>
              <span style={{ color: '#FFF', fontWeight: 600, fontSize: '0.88rem' }}>
                {staff.email || 'Not provided'}
              </span>
            </div>
            <div className="credentials-row">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Assigned Role</span>
              <span style={{ color: 'var(--primary-400)', fontWeight: 800, fontSize: '0.88rem' }}>
                {staff.role}
              </span>
            </div>

            {/* Password Section */}
            <div className="credentials-row" style={{ alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password Status</span>
              {staff.role === 'ADMIN' ? (
                <span style={{ color: '#F87171', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={13} /> Admin Protected
                </span>
              ) : resetResult ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: '#34D399' }}>
                    {showPassword ? resetResult.newPassword : '••••••••••••'}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Encrypted
                  </span>
                  <button
                    onClick={handleResetPassword}
                    disabled={isResetting}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                  >
                    {isResetting ? 'Generating…' : 'Generate & Show Password'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(99,102,241,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.2)' }}>
            {staff.role === 'ADMIN' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#F87171" style={{ flexShrink: 0 }} />
                <span><strong>Security Policy:</strong> Admin passwords are encrypted with Bcrypt and are never displayed for security reasons.</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="var(--primary-400)" style={{ flexShrink: 0 }} />
                <span><strong>Note:</strong> If the staff member forgot their password, click <strong>Generate & Show Password</strong> above to issue a new login key.</span>
              </span>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          <button onClick={handleCopyDetails} className="btn btn-primary">
            {copied ? <><Check size={16} /> Credentials Copied!</> : <><Copy size={16} /> Copy Credentials Info</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────
export const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [resetStaff, setResetStaff] = useState<StaffMember | null>(null);
  const [viewCredentialsStaff, setViewCredentialsStaff] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department) params.set('department', department);
      if (roleFilter) params.set('role', roleFilter);
      if (activeFilter !== '') params.set('isActive', activeFilter);
      const res: any = await apiClient.get(`/staff?${params.toString()}`);
      setStaff(res.data?.staff || []);
      setTotal(res.data?.total || 0);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchStaff(); }, [search, department, roleFilter, activeFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/staff/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchStaff();
    } catch {}
    setDeleteLoading(false);
  };

  const getRoleBadgeClass = (role: Role) => {
    if (role === 'ADMIN') return 'badge-absent';
    if (role === 'MANAGER') return 'badge-late';
    if (role === 'HR') return 'badge-purple';
    return 'badge-leave';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '40px' }}
            type="text"
            placeholder="Search by name, ID, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Staff
        </button>
      </div>

      {/* Summary */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>Showing</span>
        <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{staff.length}</strong>
        <span>of</span>
        <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{total}</strong>
        <span>registered staff members</span>
      </div>

      {/* Table */}
      <div className="data-table-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading staff members…</div>
        ) : staff.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No staff members found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Base Salary</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0,
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>{member.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code
                      onClick={() => setViewCredentialsStaff(member)}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#818CF8',
                        cursor: 'pointer', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '3px 8px', borderRadius: '6px',
                        border: '1px solid rgba(99, 102, 241, 0.2)', transition: 'all 0.15s ease'
                      }}
                      title="Click to view ID & credentials"
                    >
                      {member.employeeId}
                    </code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{member.department || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{member.designation || '—'}</td>
                  <td><span className={`badge ${getRoleBadgeClass(member.role)}`}>{member.role}</span></td>
                  <td style={{ fontWeight: 800, color: '#34D399', fontSize: '0.92rem' }}>₹{(member.baseSalary || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${member.isActive ? 'badge-present' : 'badge-inactive'}`}>
                      {member.isActive ? <><UserCheck size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setViewCredentialsStaff(member)} className="btn btn-secondary btn-icon btn-sm" title="View Credentials" style={{ color: 'var(--primary-400)', borderRadius: '10px' }}><KeyRound size={15} /></button>
                      <button onClick={() => setEditStaff(member)} className="btn btn-secondary btn-icon btn-sm" title="Edit Staff" style={{ borderRadius: '10px' }}><Edit size={15} /></button>
                      <button onClick={() => setResetStaff(member)} className="btn btn-secondary btn-icon btn-sm" title="Reset Password" style={{ borderRadius: '10px' }}><Key size={15} /></button>
                      <button onClick={() => setDeleteTarget(member)} className="btn btn-icon btn-sm" title="Delete Staff" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <StaffModal onClose={() => setShowAddModal(false)} onSave={fetchStaff} />}
      {editStaff && <StaffModal staff={editStaff} onClose={() => setEditStaff(null)} onSave={fetchStaff} />}
      {resetStaff && <ResetPasswordModal staff={resetStaff} onClose={() => setResetStaff(null)} />}
      {viewCredentialsStaff && <ViewCredentialsModal staff={viewCredentialsStaff} onClose={() => setViewCredentialsStaff(null)} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#F87171' }}>Confirm Delete</span>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong style={{ color: '#FFF' }}>{deleteTarget.name}</strong> ({deleteTarget.employeeId})?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger">
                {deleteLoading ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Users, CalendarCheck, ClipboardList, FileWarning, Clock, CheckCircle, UserPlus, Send, Settings, Calendar, ChevronRight } from 'lucide-react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStaff: number;
  activeStaff: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingLeaves: number;
  checkedOutToday: number;
}

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor: string;
  sub?: string;
}> = ({ label, value, icon, accentColor, sub }) => (
  <div className="card" style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '16px',
    borderTop: `2px solid ${accentColor}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </span>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        backgroundColor: `${accentColor}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accentColor,
      }}>
        {icon}
      </div>
    </div>

    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [staffRes, attRes, leaveRes] = await Promise.allSettled([
          apiClient.get('/staff?limit=1') as Promise<any>,
          apiClient.get(`/attendance/admin/all?limit=200`) as Promise<any>,
          apiClient.get('/leaves/admin/all?status=PENDING&limit=1') as Promise<any>,
        ]);

        const staffData = staffRes.status === 'fulfilled' ? (staffRes.value as any)?.data : null;
        const attData = attRes.status === 'fulfilled' ? (attRes.value as any)?.data : null;
        const leaveData = leaveRes.status === 'fulfilled' ? (leaveRes.value as any)?.data : null;

        const summary = attData?.summary;
        const total = summary?.totalStaff || staffData?.total || 0;

        setStats({
          totalStaff: total,
          activeStaff: total,
          presentToday: summary ? (summary.checkedInCount + summary.checkedOutCount) : 0,
          absentToday: summary ? summary.notCheckedInCount + summary.absentCount : 0,
          lateToday: summary ? summary.lateCount : 0,
          pendingLeaves: leaveData?.total || 0,
          checkedOutToday: summary ? summary.checkedOutCount : 0,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: 'var(--primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Welcome Card */}
      <div className="card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Campus Overview
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            Welcome back, Administrator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{today}</p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 18px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Campus Local Time
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#F87171', fontSize: '0.85rem',
        }}>
          {error} — Some live data may be unavailable.
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <StatCard
          label="Total Staff"
          value={stats?.totalStaff ?? '--'}
          icon={<Users size={18} />}
          accentColor="#6366F1"
          sub="Registered employees"
        />
        <StatCard
          label="Present Today"
          value={stats?.presentToday ?? '--'}
          icon={<CheckCircle size={18} />}
          accentColor="#10B981"
          sub="Checked in & active"
        />
        <StatCard
          label="Late Arrivals"
          value={stats?.lateToday ?? '--'}
          icon={<Clock size={18} />}
          accentColor="#F59E0B"
          sub="Late check-ins today"
        />
        <StatCard
          label="Absent Today"
          value={stats?.absentToday ?? '--'}
          icon={<CalendarCheck size={18} />}
          accentColor="#EF4444"
          sub="Not checked in yet"
        />
        <StatCard
          label="Checked Out"
          value={stats?.checkedOutToday ?? '--'}
          icon={<ClipboardList size={18} />}
          accentColor="#06B6D4"
          sub="Completed day shift"
        />
        <StatCard
          label="Pending Leaves"
          value={stats?.pendingLeaves ?? '--'}
          icon={<FileWarning size={18} />}
          accentColor="#A855F7"
          sub="Awaiting admin review"
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.2px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Staff Directory', sub: 'Add or manage employees', path: '/staff', icon: UserPlus, color: '#6366F1' },
            { label: 'Leave Approvals', sub: 'Review pending requests', path: '/leaves', icon: FileWarning, color: '#A855F7' },
            { label: 'Attendance Logs', sub: 'View daily check-ins & GPS', path: '/attendance', icon: CalendarCheck, color: '#10B981' },
            { label: 'Holiday Calendar', sub: 'Manage events & breaks', path: '/holidays', icon: Calendar, color: '#F59E0B' },
            { label: 'Announcements', sub: 'Broadcast school notices', path: '/notifications', icon: Send, color: '#06B6D4' },
            { label: 'School Settings', sub: 'Configure location & shift', path: '/settings', icon: Settings, color: '#EF4444' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  backgroundColor: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color,
                  flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.sub}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

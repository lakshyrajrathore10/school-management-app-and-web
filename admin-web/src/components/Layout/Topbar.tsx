import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-app)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Left: page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onMobileMenuToggle && (
          <button onClick={onMobileMenuToggle} className="btn btn-secondary btn-icon btn-sm">
            <Menu size={16} />
          </button>
        )}
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Operational Status + Profile + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#34D399',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>System Operational</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 10px 4px 6px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#FFF',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {user?.role || 'ADMIN'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-icon btn-sm"
          title="Sign Out"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your school attendance system' },
  '/staff': { title: 'Staff Management', subtitle: 'Manage employee accounts and credentials' },
  '/attendance': { title: 'Attendance Logs', subtitle: 'View and manage daily attendance records' },
  '/leaves': { title: 'Leave Requests', subtitle: 'Approve or reject staff leave applications' },
  '/salary': { title: 'Salary Management', subtitle: 'Generate pay slips & track employee salary status' },
  '/holidays': { title: 'Holiday Calendar', subtitle: 'Manage school holidays and events' },
  '/notifications': { title: 'Announcements', subtitle: 'Broadcast circulars and notices to staff' },
  '/settings': { title: 'School Settings', subtitle: 'Configure school location and shift timings' },
};

export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const pageInfo = pageTitles[pathname] || { title: 'Admin Panel', subtitle: '' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    const map = {
      '/employees': 'Employees',
      '/departments': 'Departments',
      '/positions': 'Positions',
      '/users': 'Users',
      '/report': 'Reports',
    };
    if (path.startsWith('/employees/new')) return 'Add Employee';
    if (path.startsWith('/employees/')) return 'Edit Employee';
    return 'HRMS';
  })();

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="sidebar-content">
        <div className="sidebar-topbar">
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
            <span className="page-title">{pageTitle}</span>
          </div>
          <div className="topbar-right">
            <span className="text-muted small">{user?.UserName || ''}</span>
          </div>
        </div>
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText, LogOut, ShieldCheck, KeyRound, X, Check
} from 'lucide-react';
import api from '../api';

const navItems = [
  { label: 'MAIN', items: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'MANAGEMENT', items: [
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/positions', label: 'Positions', icon: Briefcase },
    { path: '/users', label: 'Users', icon: ShieldCheck },
    { path: '/report', label: 'Reports', icon: FileText },
  ]},
];

export default function Sidebar({ user, onLogout, open, onClose }) {
  const location = useLocation();
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (!currentPassword || !newPassword) { setPwErr('Fill all fields'); return; }
    if (newPassword.length < 4) { setPwErr('Password must be at least 4 characters'); return; }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPwMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword('');
      setTimeout(() => setShowPwModal(false), 1500);
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const PwModal = () => (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1060}} onClick={() => { setShowPwModal(false); setPwErr(''); setPwMsg(''); }}>
      <div style={{background:'#fff',borderRadius:'1rem',padding:'1.5rem',width:'100%',maxWidth:'400px',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)'}} onClick={e => e.stopPropagation()}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <KeyRound size={20} style={{color:'#3b82f6'}} />
          <h6 style={{margin:0,fontWeight:600}}>Change Password</h6>
          <button className="btn btn-sm btn-outline-secondary ms-auto" style={{border:'none',padding:'0.25rem'}} onClick={() => { setShowPwModal(false); setPwErr(''); setPwMsg(''); }}><X size={18} /></button>
        </div>
        {pwErr && <div className="alert alert-danger py-2 small">{pwErr}</div>}
        {pwMsg && <div className="alert alert-success py-2 small d-flex align-items-center gap-2"><Check size={16} />{pwMsg}</div>}
        <form onSubmit={handleChangePassword}>
          <div className="mb-2">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn w-100" disabled={pwLoading} style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500}}>
            {pwLoading ? <span className="spinner-border spinner-border-sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-header">
          <Building2 />
          <span>DAB HRMS</span>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.UserName ? user.UserName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="name">{user.name || user.UserName || 'User'}</div>
              <div className="role">Administrator</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link${isActive(item.path) ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => setShowPwModal(true)} style={{width:'100%',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
            <KeyRound />
            Change Password
          </button>
          <button className="sidebar-link" onClick={onLogout} style={{width:'100%',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
            <LogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {showPwModal && <PwModal />}
    </>
  );
}

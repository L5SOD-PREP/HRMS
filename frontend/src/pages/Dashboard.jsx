import { useState, useEffect, useRef } from 'react';
import api from '../api';
import {
  Users, Building2, Briefcase, UserCheck, UserX, Clock, AlertTriangle,
  Skull, MapPin, TrendingUp, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  'On leave': { icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  'Left': { icon: UserX, color: '#ef4444', bg: '#fee2e2' },
  'Blacklisted': { icon: AlertTriangle, color: '#ec4899', bg: '#fce7f3' },
  'Deceased': { icon: Skull, color: '#64748b', bg: '#e2e8f0' },
  'On mission': { icon: MapPin, color: '#3b82f6', bg: '#dbeafe' },
  'Active': { icon: UserCheck, color: '#10b981', bg: '#d1fae5' },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    Promise.all([
      api.get('/employees/stats').then(r => r.data).catch(() => null),
      api.get('/employees?limit=5').then(r => {
        const data = r.data;
        return Array.isArray(data) ? data : (data.employees || []);
      }).catch(() => [])
    ]).then(([s, emp]) => {
      if (mountedRef.current) {
        if (s) setStats(s);
        setRecentEmployees(emp);
        setDataLoading(false);
      }
    });
    return () => { mountedRef.current = false; };
  }, []);

  const statusStats = stats?.statusCounts || {};

  if (dataLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="card-dash p-4 mb-4">
        <h4 style={{fontWeight:700,color:'#0f172a'}}>Welcome to DAB HRMS</h4>
        <p className="mb-0" style={{color:'#64748b'}}>Your centralized human resource management platform.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card-dash stat-card">
            <div className="stat-icon" style={{background:'#dbeafe'}}><Users size={22} style={{color:'#2563eb'}} /></div>
            <div className="stat-info">
              <h3 style={{color:'#1e293b'}}>{stats?.totalEmployees ?? '-'}</h3>
              <p>Total Employees</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card-dash stat-card">
            <div className="stat-icon" style={{background:'#d1fae5'}}><UserCheck size={22} style={{color:'#059669'}} /></div>
            <div className="stat-info">
              <h3 style={{color:'#1e293b'}}>{statusStats['Active'] ?? 0}</h3>
              <p>Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card-dash stat-card">
            <div className="stat-icon" style={{background:'#fef3c7'}}><Clock size={22} style={{color:'#d97706'}} /></div>
            <div className="stat-info">
              <h3 style={{color:'#1e293b'}}>{(statusStats['On leave'] ?? 0) + (statusStats['On mission'] ?? 0)}</h3>
              <p>On Leave/Mission</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card-dash stat-card">
            <div className="stat-icon" style={{background:'#e2e8f0'}}><Building2 size={22} style={{color:'#475569'}} /></div>
            <div className="stat-info">
              <h3 style={{color:'#1e293b'}}>{stats?.totalDepartments ?? '-'}</h3>
              <p>Departments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card-dash p-3">
            <h6 style={{fontWeight:600,fontSize:'0.95rem',marginBottom:'1rem'}}>Employee Status Overview</h6>
            {Object.entries(statusConfig).map(([status, cfg]) => {
              const Icon = cfg.icon;
              const count = statusStats[status] || 0;
              const total = stats?.totalEmployees || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="d-flex align-items-center mb-2">
                  <div className="stat-icon" style={{width:'36px',height:'36px',borderRadius:'8px',background:cfg.bg,marginRight:'0.75rem'}}>
                    <Icon size={16} style={{color:cfg.color}} />
                  </div>
                  <div style={{flex:1}}>
                    <div className="d-flex justify-content-between small">
                      <span style={{fontWeight:500}}>{status}</span>
                      <span style={{fontWeight:600}}>{count}</span>
                    </div>
                    <div className="progress" style={{height:'5px',background:'#e2e8f0',borderRadius:'3px',marginTop:'3px'}}>
                      <div className="progress-bar" style={{width:`${pct}%`,background:cfg.color,borderRadius:'3px'}} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card-dash p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 style={{fontWeight:600,fontSize:'0.95rem',margin:0}}>Recent Employees</h6>
              <Link to="/employees" className="text-decoration-none small" style={{color:'#3b82f6',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            {recentEmployees.length === 0 ? (
              <p className="text-muted small mb-0">No employees found.</p>
            ) : (
              <div style={{maxHeight:'300px',overflowY:'auto'}}>
                {recentEmployees.map(emp => {
                  const cfg = statusConfig[emp.EmpStatus] || statusConfig['Active'];
                  const Icon = cfg.icon;
                  const initials = (emp.EmpFirstName?.[0] || '') + (emp.EmpLastName?.[0] || '') || '?';
                  return (
                    <div key={emp.EmpID} className="d-flex align-items-center py-2" style={{borderBottom:'1px solid #f1f5f9'}}>
                      <div className="sidebar-avatar" style={{width:'34px',height:'34px',fontSize:'0.8rem',marginRight:'0.75rem'}}>
                        {initials}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:500,fontSize:'0.9rem'}}>{emp.EmpFirstName} {emp.EmpLastName}</div>
                        <div className="text-muted" style={{fontSize:'0.8rem'}}>{emp.EmpEmail}</div>
                      </div>
                      <span className="badge-status" style={{background:cfg.bg,color:cfg.color,display:'flex',alignItems:'center',gap:'0.25rem'}}>
                        <Icon size={10} /> {emp.EmpStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

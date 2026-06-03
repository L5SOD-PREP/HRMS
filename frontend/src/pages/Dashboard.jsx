import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statusColors = {
  'On mission': 'bg-success',
  'On leave': 'bg-warning text-dark',
  'Left': 'bg-secondary',
  'Blacklisted': 'bg-dark',
  'Deceased': 'bg-danger'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, departments: 0, positions: 0, users: 0 });
  const [statusCounts, setStatusCounts] = useState([]);
  const [deptCounts, setDeptCounts] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/departments'),
      api.get('/positions'),
      api.get('/users'),
      api.get('/reports/employee-count-by-status'),
      api.get('/reports/employee-count-by-department')
    ]).then(([emp, dept, pos, users, status, deptCnt]) => {
      setStats({
        employees: emp.data.length,
        departments: dept.data.length,
        positions: pos.data.length,
        users: users.data.length
      });
      setStatusCounts(status.data);
      setDeptCounts(deptCnt.data);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="welcome-banner">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3><i className="bi bi-house-fill me-2"></i>Welcome, {user?.name || 'User'}!</h3>
            <p>DAB Enterprise LTD — Human Resource Management System</p>
          </div>
          <i className="bi bi-buildings" style={{ fontSize: '3.5rem', opacity: 0.3 }}></i>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Link to="/employees" className="text-decoration-none">
            <div className="stat-card bg-card-blue">
              <i className="bi bi-people stat-icon"></i>
              <div className="stat-number">{stats.employees}</div>
              <div className="stat-label">Total Employees</div>
              <span className="stat-link">View details &rarr;</span>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/departments" className="text-decoration-none">
            <div className="stat-card bg-card-green">
              <i className="bi bi-diagram-3 stat-icon"></i>
              <div className="stat-number">{stats.departments}</div>
              <div className="stat-label">Departments</div>
              <span className="stat-link">View details &rarr;</span>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/positions" className="text-decoration-none">
            <div className="stat-card bg-card-orange">
              <i className="bi bi-briefcase stat-icon"></i>
              <div className="stat-number">{stats.positions}</div>
              <div className="stat-label">Positions</div>
              <span className="stat-link">View details &rarr;</span>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/users" className="text-decoration-none">
            <div className="stat-card bg-card-purple">
              <i className="bi bi-person-badge stat-icon"></i>
              <div className="stat-number">{stats.users}</div>
              <div className="stat-label">System Users</div>
              <span className="stat-link">View details &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header"><i className="bi bi-pie-chart me-2"></i>Employees by Status</div>
            <div className="card-body">
              <table className="table table-custom mb-0">
                <thead><tr><th>Status</th><th>Count</th></tr></thead>
                <tbody>
                  {statusCounts.map(s => (
                    <tr key={s.EmpStatus}>
                      <td><span className={`badge-status ${statusColors[s.EmpStatus] || 'bg-secondary'}`}>{s.EmpStatus}</span></td>
                      <td><strong>{s.count}</strong></td>
                    </tr>
                  ))}
                  {statusCounts.length === 0 && <tr><td colSpan={2} className="empty-state py-3">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header"><i className="bi bi-bar-chart me-2"></i>Employees by Department</div>
            <div className="card-body">
              <table className="table table-custom mb-0">
                <thead><tr><th>Department</th><th>Count</th></tr></thead>
                <tbody>
                  {deptCounts.map(d => (
                    <tr key={d.DepartName}><td>{d.DepartName}</td><td><strong>{d.count}</strong></td></tr>
                  ))}
                  {deptCounts.length === 0 && <tr><td colSpan={2} className="empty-state py-3">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header"><i className="bi bi-lightning-charge me-2"></i>Quick Actions</div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <Link to="/employees/new" className="btn btn-outline-primary w-100"><i className="bi bi-person-plus me-1"></i> Add Employee</Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/departments" className="btn btn-outline-success w-100"><i className="bi bi-diagram-3 me-1"></i> Departments</Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/positions" className="btn btn-outline-warning w-100"><i className="bi bi-briefcase me-1"></i> Positions</Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/report" className="btn btn-outline-info w-100"><i className="bi bi-file-text me-1"></i> View Report</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

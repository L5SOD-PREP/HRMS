import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: 'bi-house-fill' },
  { to: '/employees', label: 'Employees', icon: 'bi-people' },
  { to: '/departments', label: 'Departments', icon: 'bi-diagram-3' },
  { to: '/positions', label: 'Positions', icon: 'bi-briefcase' },
  { to: '/users', label: 'Users', icon: 'bi-person-badge' },
  { to: '/report', label: 'Report', icon: 'bi-file-text' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-building me-2"></i>DAB HRMS
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {links.map(l => (
              <li className="nav-item" key={l.to}>
                <Link className={`nav-link ${location.pathname === l.to ? 'active' : ''}`} to={l.to}>
                  <i className={`bi ${l.icon}`}></i>{l.label}
                </Link>
              </li>
            ))}
          </ul>
          {user && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white-50" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-person-circle me-1"></i>{user.name}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Departments from './pages/Departments';
import Positions from './pages/Positions';
import Users from './pages/Users';
import Report from './pages/Report';

export default function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{height:'100vh',background:'#0f172a'}}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const wrap = (element) => (
    <ProtectedRoute>
      <DashboardLayout user={user} onLogout={handleLogout}>
        {element}
      </DashboardLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={wrap(<Dashboard />)} />
      <Route path="/employees" element={wrap(<Employees />)} />
      <Route path="/employees/new" element={wrap(<EmployeeForm />)} />
      <Route path="/employees/:id" element={wrap(<EmployeeForm />)} />
      <Route path="/departments" element={wrap(<Departments />)} />
      <Route path="/positions" element={wrap(<Positions />)} />
      <Route path="/users" element={wrap(<Users />)} />
      <Route path="/report" element={wrap(<Report />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

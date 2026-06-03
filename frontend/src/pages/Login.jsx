import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ width: '420px', maxWidth: '95%' }}>
        <div className="card-header-custom">
          <i className="bi bi-building" style={{ fontSize: '2.5rem', opacity: 0.8 }}></i>
          <h3>DAB Enterprise LTD</h3>
          <p>Human Resource Management System</p>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label"><i className="bi bi-person me-1"></i>Username</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input className="form-control" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label"><i className="bi bi-lock me-1"></i>Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
              <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-decoration-none" style={{ fontSize: '0.88rem' }}>
              <i className="bi bi-question-circle me-1"></i>Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

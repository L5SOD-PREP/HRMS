import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-icon">
          <Building2 />
          <span>DAB HRMS</span>
        </div>
        <h4>Welcome Back</h4>
        <p className="text-muted">Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-danger py-2 small">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text" className="form-control" placeholder="Enter your username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              autoComplete="username" autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'} className="form-control" placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{borderColor:'#e2e8f0'}}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <LogIn size={16} style={{marginRight:'0.35rem',verticalAlign:'middle'}} />
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/forgot-password" className="text-decoration-none small" style={{color:'#3b82f6'}}>
            Forgot your password?
          </Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/" className="text-decoration-none small text-muted">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

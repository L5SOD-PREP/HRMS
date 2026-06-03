import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Building2, ArrowLeft, ShieldCheck, KeyRound, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const navigateTimer = useRef(null);

  useEffect(() => {
    return () => { if (navigateTimer.current) clearTimeout(navigateTimer.current); };
  }, []);

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!username.trim()) { setError('Enter your username'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/security-question', { username });
      setQuestion(res.data.question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Username not found');
    } finally { setLoading(false); }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!answer.trim()) { setError('Enter the answer'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-answer', { username, answer });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect answer');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!newPassword.trim()) { setError('Enter a new password'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { username, answer, newPassword });
      setMessage('Password reset successfully!');
      navigateTimer.current = setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const stepIndicator = (num) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',marginBottom:'1.5rem'}} role="navigation" aria-label="Reset password steps">
      {[1,2,3].map(s => (
        <div key={s} role="step" aria-current={step === s ? 'step' : undefined} style={{
          width:'32px',height:'32px',borderRadius:'50%',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontWeight:600,fontSize:'0.85rem',
          background: step >= s ? '#3b82f6' : '#e2e8f0',
          color: step >= s ? '#fff' : '#94a3b8',
          transition:'all .2s'
        }}>{s}</div>
      ))}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-icon">
          <Building2 />
          <span>DAB HRMS</span>
        </div>
        <h4>Reset Password</h4>
        <p className="text-muted">Follow the steps to reset your password</p>

        {stepIndicator(step)}

        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {message && <div className="alert alert-success py-2 small d-flex align-items-center gap-2"><CheckCircle size={16} />{message}</div>}

        {step === 1 && (
          <form onSubmit={handleGetQuestion}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <ShieldCheck size={16} style={{marginRight:'0.35rem',verticalAlign:'middle'}} />}
              Get Security Question
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAnswer}>
            <div className="mb-3">
              <label className="form-label">Security Question</label>
              <div className="form-control" style={{background:'#f1f5f9',padding:'0.5rem 0.75rem',borderRadius:'0.375rem',fontSize:'0.9rem'}}>
                {question}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Your Answer</label>
              <input type="text" className="form-control" placeholder="Enter your answer" value={answer} onChange={e => setAnswer(e.target.value)} autoFocus />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <KeyRound size={16} style={{marginRight:'0.35rem',verticalAlign:'middle'}} />}
              Verify Answer
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <KeyRound size={16} style={{marginRight:'0.35rem',verticalAlign:'middle'}} />}
              Reset Password
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none small" style={{color:'#3b82f6',display:'inline-flex',alignItems:'center',gap:'0.25rem'}}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
        <div className="text-center mt-1">
          <Link to="/" className="text-decoration-none small text-muted">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

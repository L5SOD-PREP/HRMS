import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [secId, setSecId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.get(`/auth/security-question/${username}`);
      setSecId(res.data.secId);
      setQuestion(res.data.question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Username not found');
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/verify-answer', { secId, answer });
      setUserId(res.data.userId);
      setMessage('Answer verified! Set a new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect answer');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { userId, newPassword });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">Forgot Password</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              {step === 1 && (
                <form onSubmit={handleGetQuestion}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Get Security Question</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyAnswer}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Security Question</label>
                    <p className="text-muted">{question}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Answer</label>
                    <input className="form-control" value={answer} onChange={e => setAnswer(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Verify Answer</button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label">New Password (min 4 chars)</label>
                    <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4} />
                  </div>
                  <button type="submit" className="btn btn-success w-100">Reset Password</button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

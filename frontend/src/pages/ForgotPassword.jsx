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
      setMessage('Password reset successful! Redirecting...');
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
            <div className="card-header"><i className="bi bi-key me-2"></i>Password Recovery</div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
              {message && <div className="alert alert-success py-2"><i className="bi bi-check-circle me-2"></i>{message}</div>}

              {step === 1 && (
                <form onSubmit={handleGetQuestion}>
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-person me-1"></i>Username</label>
                    <input className="form-control" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100"><i className="bi bi-question-lg me-1"></i>Get Security Question</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyAnswer}>
                  <div className="mb-3">
                    <label className="form-label fw-bold"><i className="bi bi-shield-question me-1"></i>Security Question</label>
                    <div className="alert alert-info">{question}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Answer</label>
                    <input className="form-control" placeholder="Type your answer" value={answer} onChange={e => setAnswer(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100"><i className="bi bi-check2 me-1"></i>Verify Answer</button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-lock me-1"></i>New Password</label>
                    <input type="password" className="form-control" placeholder="Min 4 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4} />
                  </div>
                  <button type="submit" className="btn btn-success w-100"><i className="bi bi-arrow-clockwise me-1"></i>Reset Password</button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none"><i className="bi bi-arrow-left me-1"></i>Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

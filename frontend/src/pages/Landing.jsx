import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, ShieldCheck, BarChart3, TrendingUp, Clock, ArrowRight
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Employee Management', desc: 'Complete employee lifecycle management with status tracking and profiles.' },
  { icon: Building2, title: 'Departments & Positions', desc: 'Organize your workforce with structured departments and roles.' },
  { icon: ShieldCheck, title: 'Secure Access Control', desc: 'Role-based authentication with password recovery via security questions.' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Real-time insights including employee status breakdowns and leave reports.' },
  { icon: TrendingUp, title: 'Attendance Tracking', desc: 'Monitor employee presence and manage leave requests efficiently.' },
  { icon: Clock, title: 'Audit Trail', desc: 'Track changes with comprehensive logging and activity monitoring.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-nav">
        <div className="landing-logo">
          <Building2 size={28} />
          DAB Enterprise LTD
        </div>
        <button className="landing-btn" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </div>

      <div className="landing-hero">
        <div className="landing-badge">
          <ShieldCheck size={14} />
          v2.0 — Human Resource Management System
        </div>
        <h1>
          Manage Your <span>Workforce</span><br />
          With Confidence
        </h1>
        <p>
          A comprehensive HR management solution for DAB Enterprise LTD.
          Streamline employee records, track attendance, and generate insightful reports.
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary-glow" onClick={() => navigate('/login')}>
            Get Started <ArrowRight size={16} style={{marginLeft:'0.35rem',verticalAlign:'middle'}} />
          </button>
          <button className="btn" style={{background:'transparent',border:'1px solid #cbd5e1',color:'#475569'}} onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </button>
        </div>
      </div>

      <div className="landing-features">
        {features.map((f) => (
          <div className="landing-feat-card" key={f.title}>
            <f.icon />
            <h5>{f.title}</h5>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="landing-footer">
        &copy; {new Date().getFullYear()} DAB Enterprise LTD — All rights reserved.
      </div>
    </div>
  );
}

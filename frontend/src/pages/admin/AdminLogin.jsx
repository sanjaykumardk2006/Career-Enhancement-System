import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';
import '../auth/Auth.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (alert) setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const { data } = await login(form);

      // Enforce strict administrative role check
      if (data.role !== 'admin') {
        setAlert({
          type: 'error',
          title: 'Access Denied: Insufficient Privileges',
          message: 'This account does not have administrator privileges. Please use the candidate / student login portal.',
        });
        toast.error('Access Denied: Administrator privileges required.');
        return;
      }

      loginUser(data);
      toast.success(`Welcome Administrator, ${data.name}! 🛡️`);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setAlert({
        type: 'error',
        title: 'Authentication Failed',
        message: msg,
      });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow" style={{ width: 500, height: 500, background: '#f59e0b', top: -100, right: -100, opacity: 0.08 }} />
        <div className="auth-glow" style={{ width: 450, height: 450, background: '#d97706', bottom: -100, left: -100, opacity: 0.06 }} />
      </div>

      <div className="auth-container animate-fade-in">
        <div className="auth-brand">
          <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CareerAI Admin
          </h1>
          <p>Administrative Control Gateway</p>
        </div>

        <div className="auth-card admin-card-border">
          <div className="admin-badge-banner">
            <ShieldCheck size={14} />
            <span>Restricted Gateway · Authorized Personnel Only</span>
          </div>

          <h2>Administrator Sign In</h2>
          <p className="auth-subtitle">Verify your administrative credentials to continue</p>

          {alert && (
            <div className={`auth-alert auth-alert-${alert.type} animate-shake`}>
              <div className="auth-alert-header">
                {alert.type === 'error' ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}
                <strong>{alert.title}</strong>
              </div>
              <p className="auth-alert-desc">{alert.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Admin Email or Username</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="admin-email"
                  name="email"
                  type="text"
                  placeholder="admin@careerai.com"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input with-icon with-icon-right"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="admin-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg btn-admin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Authenticating Administrator...
                </>
              ) : (
                'Authenticate as Admin'
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={14} style={{ color: '#f59e0b' }} />
            <span>Encrypted administrative session with RBAC enforcement</span>
          </div>

          <p className="auth-footer">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={14} /> Back to Student Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

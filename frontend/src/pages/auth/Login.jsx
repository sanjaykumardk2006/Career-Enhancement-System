import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle, AlertTriangle, CheckCircle2, UserPlus, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(
    location.state?.registeredSuccess
      ? {
          type: 'success',
          title: 'Account Registered in Database',
          message: 'Your account has been saved! Please enter your password to sign in.',
          showSignupBtn: false,
        }
      : null
  );

  useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (alert && alert.type !== 'success') setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const { data } = await login(form);
      loginUser(data);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const msg = data?.message || 'Login failed. Check your credentials.';

      // Case 1: Account not in database -> Prompt to sign up first
      if (
        status === 404 ||
        data?.code === 'USER_NOT_FOUND' ||
        msg.toLowerCase().includes('sign up first') ||
        msg.toLowerCase().includes('no account')
      ) {
        setAlert({
          type: 'warning',
          title: 'Account Not Found',
          message: 'No account found with this email in the database. Please sign up first!',
          showSignupBtn: true,
        });
        toast.error('No account found in database. Please sign up first!');
      }
      // Case 2: User exists, but credentials / password are incorrect
      else if (
        status === 401 ||
        data?.code === 'INVALID_CREDENTIALS' ||
        msg.toLowerCase().includes('incorrect') ||
        msg.toLowerCase().includes('password')
      ) {
        setAlert({
          type: 'error',
          title: 'Incorrect Credentials',
          message: 'Incorrect credentials. Please enter the correct username or password.',
          showSignupBtn: false,
        });
        toast.error('Incorrect credentials. Please enter the correct username or password.');
      }
      // Other error
      else {
        setAlert({
          type: 'error',
          title: 'Sign In Failed',
          message: msg,
          showSignupBtn: false,
        });
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow glow-1" />
        <div className="auth-glow glow-2" />
        <div className="auth-glow glow-3" />
      </div>
      <div className="auth-container animate-fade-in">
        <div className="auth-brand">
          <div className="auth-logo"><Zap size={28} /></div>
          <h1>CareerAI</h1>
          <p>Your AI-powered career enhancement platform</p>
        </div>
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in with your database credentials</p>

          {/* Dynamic Database Feedback Alert */}
          {alert && (
            <div className={`auth-alert auth-alert-${alert.type} animate-shake`}>
              <div className="auth-alert-header">
                {alert.type === 'warning' && <AlertTriangle size={18} />}
                {alert.type === 'error' && <AlertCircle size={18} />}
                {alert.type === 'success' && <CheckCircle2 size={18} />}
                <strong>{alert.title}</strong>
              </div>
              <p className="auth-alert-desc">{alert.message}</p>
              {alert.showSignupBtn && (
                <Link
                  to="/register"
                  state={{ email: form.email }}
                  className="auth-alert-btn"
                >
                  <UserPlus size={14} /> Sign Up First
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address or Username</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  placeholder="name@example.com"
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
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Verifying Credentials...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={14} style={{ color: 'var(--primary-light)' }} />
            <span>Securely authenticated via MongoDB</span>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up first</Link>
          </p>

          <div className="auth-admin-link">
            <Link to="/admin/login">
              <ShieldCheck size={13} />
              <span>Administrative Gateway</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

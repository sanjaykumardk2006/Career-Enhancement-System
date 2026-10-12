import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
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
          <p className="auth-subtitle">Sign in to continue your journey</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input id="login-email" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className="form-input with-icon" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={handleChange} className="form-input with-icon with-icon-right" required />
                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner-sm" />Signing In...</> : 'Sign In'}
            </button>
          </form>
          <div className="auth-divider"><span>Demo Credentials</span></div>
          <div className="demo-creds">
            <p>Student: <code>student@demo.com</code> / <code>demo123</code></p>
            <p>Admin: <code>admin@demo.com</code> / <code>admin123</code></p>
          </div>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

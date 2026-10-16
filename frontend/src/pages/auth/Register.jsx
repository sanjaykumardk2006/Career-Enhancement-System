import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { register } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Compass, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your full name');
    if (!form.email.trim()) return toast.error('Please enter your email address');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success('Account successfully registered.');
      navigate('/login', {
        state: {
          email: form.email.trim(),
          registeredSuccess: true,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <div className="auth-brand">
          <div className="auth-logo"><Compass size={24} strokeWidth={2.4} /></div>
          <h1>CareerOS</h1>
          <p>Career Intelligence Platform</p>
        </div>
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="auth-subtitle">Sign up to launch your career workspace</p>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
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
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-input with-icon with-icon-right"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Storing in Database...
                </>
              ) : (
                'Sign Up & Save Account'
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={14} style={{ color: 'var(--primary-light)' }} />
            <span>Credentials will be securely encrypted in MongoDB</span>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

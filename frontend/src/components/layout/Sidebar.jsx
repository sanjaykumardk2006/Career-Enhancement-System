import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, Briefcase, FileText, Brain,
  Mic, BookOpen, TrendingUp, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, MessageSquare, X, Compass, Sparkles
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/career/goals', icon: TrendingUp, label: 'Career Goals' },
  { to: '/career/recommendations', icon: Brain, label: 'AI Recommendations' },
  { to: '/career/chatbot', icon: MessageSquare, label: 'Career Copilot' },
  { to: '/resume/builder', icon: FileText, label: 'Resume Builder' },
  { to: '/resume/upload', icon: Sparkles, label: 'Resume Intelligence' },
  { to: '/skills/gap', icon: BookOpen, label: 'Skill Gap Matrix' },
  { to: '/skills/roadmap', icon: Compass, label: 'Learning Roadmap' },
  { to: '/interview', icon: Mic, label: 'Mock Interview' },
  { to: '/jobs', icon: Briefcase, label: 'Pipeline Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' },
];

export default function Sidebar({ mobileOpen = false, closeMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (closeMobile) closeMobile();
    logoutUser();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (closeMobile) closeMobile();
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Compass size={20} strokeWidth={2.4} />
            </div>
            <div>
              <span className="brand-name">CareerOS</span>
              <span className="brand-sub">Intelligence Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="brand-icon-only">
            <Compass size={20} strokeWidth={2.4} />
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          className="collapse-btn desktop-only"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        {/* Mobile Close Button */}
        <button
          className="mobile-close-btn"
          onClick={closeMobile}
          aria-label="Close Navigation Menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} strokeWidth={2} />
            {(!collapsed || mobileOpen) && <span>{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-divider" />
            <div className="nav-group-title">
              {(!collapsed || mobileOpen) && <span>Administration</span>}
            </div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={handleNavClick}
                className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} strokeWidth={2} />
                {(!collapsed || mobileOpen) && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={17} strokeWidth={2} />
          {(!collapsed || mobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

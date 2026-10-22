import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, Briefcase, FileText, Brain,
  Mic, BookOpen, TrendingUp, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, MessageSquare, X, Compass, Sparkles, Users, Lock, Eye
} from 'lucide-react';
import './Sidebar.css';

const studentNavItems = [
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

const adminPrimaryItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Executive Console' },
  { to: '/admin?tab=users', icon: Users, label: 'User Directory & Access' },
  { to: '/admin?tab=applications', icon: Briefcase, label: 'Applications Pipeline' },
  { to: '/admin?tab=security', icon: Lock, label: 'Security & Audit' },
];

const adminSimulatorItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Student Dashboard' },
  { to: '/career/recommendations', icon: Brain, label: 'AI Recommendations' },
  { to: '/resume/builder', icon: FileText, label: 'Resume Studio' },
  { to: '/interview', icon: Mic, label: 'Mock Interview' },
  { to: '/jobs', icon: Briefcase, label: 'Pipeline Tracker' },
];

export default function Sidebar({ mobileOpen = false, closeMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (closeMobile) closeMobile();
    logoutUser();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (closeMobile) closeMobile();
  };

  const isRouteActive = (to) => {
    if (to.includes('?')) {
      const [path, query] = to.split('?');
      return location.pathname === path && location.search === `?${query}`;
    }
    if (to === '/admin') {
      return location.pathname === '/admin' && (!location.search || location.search.includes('tab=overview'));
    }
    return location.pathname === to;
  };

  const isAdmin = user?.role === 'admin';
  const homePath = isAdmin ? '/admin' : '/dashboard';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''} ${isAdmin ? 'admin-sidebar-mode' : ''}`}>
      <div className="sidebar-header">
        <Link to={homePath} className="sidebar-brand-link" onClick={handleNavClick}>
          {!collapsed && (
            <div className="sidebar-brand">
              <div className="brand-icon" style={isAdmin ? { background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' } : {}}>
                {isAdmin ? <ShieldCheck size={20} strokeWidth={2.4} /> : <Compass size={20} strokeWidth={2.4} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="brand-name">CareerOS</span>
                  {isAdmin && <span className="sidebar-admin-tag">ADMIN</span>}
                </div>
                <span className="brand-sub">{isAdmin ? 'Executive Governance' : 'Intelligence Platform'}</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="brand-icon-only" style={isAdmin ? { background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' } : {}}>
              {isAdmin ? <ShieldCheck size={20} strokeWidth={2.4} /> : <Compass size={20} strokeWidth={2.4} />}
            </div>
          )}
        </Link>

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

      {/* User Badge */}
      <div className="sidebar-user">
        <div
          className="user-avatar"
          style={isAdmin ? { background: 'linear-gradient(135deg, #78350f, #b45309)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fef3c7' } : {}}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role" style={isAdmin ? { color: '#fbbf24', fontWeight: 600 } : {}}>
              {isAdmin ? 'Platform Administrator' : (user?.role || 'Student')}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            {/* Admin Management Section */}
            <div className="nav-group-title">
              {(!collapsed || mobileOpen) && <span>Governance & Control</span>}
            </div>
            {adminPrimaryItems.map(({ to, icon: Icon, label }) => {
              const active = isRouteActive(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={`nav-item admin-item ${active ? 'active' : ''}`}
                >
                  <Icon size={17} strokeWidth={2} />
                  {(!collapsed || mobileOpen) && <span>{label}</span>}
                </NavLink>
              );
            })}

            <div className="nav-divider" />

            {/* Student Portal Simulator Section */}
            <div className="nav-group-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {(!collapsed || mobileOpen) && (
                <>
                  <Eye size={12} color="var(--text-muted)" />
                  <span>Student Simulator</span>
                </>
              )}
            </div>
            {adminSimulatorItems.map(({ to, icon: Icon, label }) => {
              const active = isRouteActive(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {(!collapsed || mobileOpen) && <span>{label}</span>}
                </NavLink>
              );
            })}

            <div className="nav-divider" />
            <NavLink
              to="/profile"
              onClick={handleNavClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={17} strokeWidth={2} />
              {(!collapsed || mobileOpen) && <span>Admin Profile</span>}
            </NavLink>
          </>
        ) : (
          studentNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={2} />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </NavLink>
          ))
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

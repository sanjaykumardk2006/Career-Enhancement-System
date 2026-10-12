import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, Briefcase, FileText, Brain,
  Mic, BookOpen, TrendingUp, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/career/goals', icon: TrendingUp, label: 'Career Goals' },
  { to: '/career/recommendations', icon: Brain, label: 'AI Recommendations' },
  { to: '/career/chatbot', icon: MessageSquare, label: 'Career Chatbot' },
  { to: '/resume/builder', icon: FileText, label: 'Resume Builder' },
  { to: '/resume/upload', icon: Briefcase, label: 'Resume Upload' },
  { to: '/skills/gap', icon: BookOpen, label: 'Skill Gap Analysis' },
  { to: '/skills/roadmap', icon: BookOpen, label: 'Learning Roadmap' },
  { to: '/interview', icon: Mic, label: 'Mock Interview' },
  { to: '/jobs', icon: Briefcase, label: 'Job Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">⚡</div>
            <div>
              <span className="brand-name">CareerAI</span>
              <span className="brand-sub">Enhancement System</span>
            </div>
          </div>
        )}
        {collapsed && <div className="brand-icon-only">⚡</div>}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-divider" />
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

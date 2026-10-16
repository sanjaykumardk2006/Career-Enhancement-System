import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="page-wrapper">
      {/* Mobile Topbar (Visible on screens <= 768px) */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Compass size={18} strokeWidth={2.4} />
          </div>
          <span className="mobile-brand-text">CareerOS</span>
        </div>

        <div className="mobile-user-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with mobile drawer support */}
      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content animate-fade-in">
        {children}
      </main>
    </div>
  );
}

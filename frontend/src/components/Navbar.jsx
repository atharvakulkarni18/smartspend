import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiRepeat,
  FiPieChart,
  FiTrendingUp,
  FiFileText,
  FiUser,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications
    const loadNotifications = async () => {
      try {
        const notifs = await notificationService.getAll();
        setNotifications(notifs || []);
        const unread = notifs?.filter((n) => !n.read).length || 0;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
    { name: 'Transactions', path: '/transactions', icon: <FiRepeat /> },
    { name: 'Budgets', path: '/budgets', icon: <FiPieChart /> },
    { name: 'Analytics', path: '/analytics', icon: <FiTrendingUp /> },
    { name: 'Reports', path: '/reports', icon: <FiFileText /> },
    { name: 'Profile', path: '/profile', icon: <FiUser /> },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="brand-logo" onClick={() => navigate('/dashboard')}>
          <div className="logo-icon-box">
            <FiZap className="logo-spark" />
          </div>
          <span className="brand-title">Smart<span className="brand-title-accent">Spend</span></span>
        </div>

        <div className="mobile-header-actions">
          <button
            className="icon-action-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Toggle notifications"
          >
            <FiBell />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Sidebar Navigation */}
      <aside className={`sidebar-container ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="logo-icon-box">
            <FiZap className="logo-spark" />
          </div>
          <div className="brand-text">
            <h2 className="brand-title">
              Smart<span className="brand-title-accent">Spend</span>
            </h2>
            <span className="brand-badge">AI FINANCE INTELLIGENCE</span>
          </div>
        </div>

        {/* Top Notifications Bar / Actions */}
        <div className="sidebar-utility">
          <div className="notification-trigger-wrapper">
            <button
              className={`utility-button ${notificationsOpen ? 'active' : ''}`}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FiBell className="utility-icon" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="unread-pill">{unreadCount} new</span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {notificationsOpen && (
              <div className="notification-panel animate-fadeInUp">
                <div className="notif-header">
                  <h4>Alerts & Insights</h4>
                  {unreadCount > 0 && (
                    <button className="btn-text-action" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No alerts at the moment</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`notif-item ${!item.read ? 'unread' : ''}`}
                      >
                        <div className="notif-icon">
                          {item.type === 'warning' && <FiAlertTriangle className="text-yellow" />}
                          {item.type === 'success' && <FiCheckCircle className="text-green" />}
                          {item.type === 'info' && <FiInfo className="text-cyan" />}
                        </div>
                        <div className="notif-content">
                          <p className="notif-title">{item.title}</p>
                          <p className="notif-desc">{item.message}</p>
                          <span className="notif-time">{item.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN MENU</div>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-list-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.name}</span>
                  {item.name === 'Analytics' && (
                    <span className="nav-tag-ai">AI</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* AI Engine Status Card */}
        <div className="ai-status-card">
          <div className="ai-status-header">
            <span className="ai-pulse-dot" />
            <span className="ai-status-title">Smart Engine Active</span>
          </div>
          <p className="ai-status-sub">
            Real-time anomaly scanner & predictive budgeting running
          </p>
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="sidebar-user-section">
          <div className="user-profile-card" onClick={() => navigate('/profile')}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{user?.name || 'Alex Mercer'}</span>
              <span className="user-role">{user?.role || 'Premium'}</span>
            </div>
          </div>
          <button
            className="logout-button"
            onClick={logout}
            title="Sign out of SmartSpend"
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;

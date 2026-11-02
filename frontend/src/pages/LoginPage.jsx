import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiZap, FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('alex.mercer@smartspend.ai');
    setPassword('DemoPass123!');
    setIsSubmitting(true);
    const result = await login('alex.mercer@smartspend.ai', 'DemoPass123!');
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="auth-viewport">
      {/* Dynamic Ambient Background Elements */}
      <div className="ambient-orb orb-1 animate-float" />
      <div className="ambient-orb orb-2 animate-float" style={{ animationDelay: '-3s' }} />
      <div className="ambient-orb orb-3 animate-float" style={{ animationDelay: '-1.5s' }} />

      <div className="auth-card-container animate-fadeInUp">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-box">
            <FiZap className="auth-logo-spark" />
          </div>
          <h1 className="auth-title">
            Smart<span className="brand-title-accent">Spend</span>
          </h1>
          <p className="auth-subtitle">
            Next-generation AI financial intelligence & automated wealth analytics
          </p>
        </div>

        {/* Demo Quick Fill Banner */}
        <div className="demo-banner">
          <div className="demo-banner-content">
            <FiShield className="text-cyan" />
            <span>Portfolio Demo Mode Ready</span>
          </div>
          <button
            type="button"
            className="demo-pill-btn"
            onClick={handleQuickDemoLogin}
          >
            Instant Demo Sign-In
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Work or Personal Email
            </label>
            <div className="input-container">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <a
                href="#forgot"
                className="text-muted"
                style={{ fontSize: '0.78rem', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo reset instructions sent to your email.');
                }}
              >
                Forgot password?
              </a>
            </div>
            <div className="input-container">
              <FiLock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                Sign In to Dashboard <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="auth-features">
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>AI Category Engine</span>
          </div>
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>Anomaly Radar</span>
          </div>
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>Bank-grade 256-bit</span>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="auth-footer">
          <span>Don't have an account yet?</span>{' '}
          <Link to="/register" className="auth-switch-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

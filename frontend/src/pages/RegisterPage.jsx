import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-viewport">
      <div className="ambient-orb orb-1 animate-float" />
      <div className="ambient-orb orb-2 animate-float" style={{ animationDelay: '-2.5s' }} />

      <div className="auth-card-container animate-fadeInUp">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-box">
            <FiZap className="auth-logo-spark" />
          </div>
          <h1 className="auth-title">
            Join Smart<span className="brand-title-accent">Spend</span>
          </h1>
          <p className="auth-subtitle">
            Take control of your personal wealth with predictive AI budgeting
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name
            </label>
            <div className="input-container">
              <FiUser className="input-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <div className="input-container">
              <FiMail className="input-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="input-container">
              <FiLock className="input-icon" />
              <input
                id="reg-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              Confirm Password
            </label>
            <div className="input-container">
              <FiLock className="input-icon" />
              <input
                id="reg-confirm"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Creating Account...'
            ) : (
              <>
                Create SmartSpend Account <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Benefits List */}
        <div className="auth-features">
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>Real-time Sync</span>
          </div>
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>Predictive Cashflow</span>
          </div>
          <div className="auth-feature-item">
            <FiCheckCircle className="text-green" />
            <span>Free Tier Included</span>
          </div>
        </div>

        {/* Switch to Login */}
        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

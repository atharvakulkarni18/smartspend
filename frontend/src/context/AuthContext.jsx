import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService, MOCK_USER } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smartspend_user');
      return savedUser ? JSON.parse(savedUser) : MOCK_USER; // Default to demo user for instant portfolio evaluation
    } catch {
      return MOCK_USER;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smartspend_token') || 'demo-auth-token-active';
  });

  const [loading, setLoading] = useState(false);

  // Sync token into localStorage if initialized with demo
  useEffect(() => {
    if (!localStorage.getItem('smartspend_token')) {
      localStorage.setItem('smartspend_token', 'demo-auth-token-active');
    }
    if (!localStorage.getItem('smartspend_user')) {
      localStorage.setItem('smartspend_user', JSON.stringify(MOCK_USER));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully');
  }, []);

  // Listen for global auth expiration (from api interceptor)
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(null);
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('smartspend_auth_change', handleAuthChange);
    return () => window.removeEventListener('smartspend_auth_change', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const authToken = res.token || 'jwt-' + Date.now();
      const authUser = res.user || {
        ...MOCK_USER,
        email,
        name: email.split('@')[0],
      };

      localStorage.setItem('smartspend_token', authToken);
      localStorage.setItem('smartspend_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      toast.success(`Welcome back, ${authUser.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      const authToken = res.token || 'jwt-' + Date.now();
      const authUser = res.user || {
        ...MOCK_USER,
        name,
        email,
      };

      localStorage.setItem('smartspend_token', authToken);
      localStorage.setItem('smartspend_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      toast.success(`Welcome to SmartSpend, ${name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('smartspend_user', JSON.stringify(updated));
    toast.success('Profile updated successfully');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService, MOCK_USER } from '../services/api';

const AuthContext = createContext(null);

// Older builds stored this fake token. Treat it as "not logged in".
const LEGACY_DEMO_TOKEN = 'demo-auth-token-active';

const readStoredToken = () => {
  try {
    const stored = localStorage.getItem('smartspend_token');
    if (!stored || stored === LEGACY_DEMO_TOKEN) {
      localStorage.removeItem('smartspend_token');
      localStorage.removeItem('smartspend_user');
      return null;
    }
    return stored;
  } catch {
    return null;
  }
};

const readStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('smartspend_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

// The backend may name the token field differently; accept the common names.
const extractToken = (res) =>
  res?.token || res?.accessToken || res?.access_token || res?.jwt || null;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(() => (readStoredToken() ? readStoredUser() : null));
  const [loading, setLoading] = useState(false);

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

  const completeAuth = (res, fallbackUser) => {
    const authToken = extractToken(res);
    if (!authToken) {
      throw new Error('Server did not return a login token. Please try again.');
    }
    const authUser = res.user || fallbackUser;

    localStorage.setItem('smartspend_token', authToken);
    localStorage.setItem('smartspend_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    return authUser;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const authUser = completeAuth(res, {
        ...MOCK_USER,
        email,
        name: email.split('@')[0],
      });
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
      completeAuth(res, { ...MOCK_USER, name, email });
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

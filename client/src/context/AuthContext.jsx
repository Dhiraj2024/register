import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('student_reg_token'));
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('student_reg_admin');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify stored session on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('student_reg_token');
      if (!storedToken) {
        setToken(null);
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        if (response.data?.success) {
          setAdmin(response.data.admin);
          localStorage.setItem('student_reg_admin', JSON.stringify(response.data.admin));
        }
      } catch (err) {
        console.warn('Session verification failed; clearing invalid credentials.');
        localStorage.removeItem('student_reg_token');
        localStorage.removeItem('student_reg_admin');
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    // Listen for 401 events broadcast from Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setAdmin(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Log in with username and password
   */
  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token: receivedToken, admin: adminData } = response.data;

    localStorage.setItem('student_reg_token', receivedToken);
    localStorage.setItem('student_reg_admin', JSON.stringify(adminData));

    setToken(receivedToken);
    setAdmin(adminData);

    return response.data;
  };

  /**
   * Log out and clear state
   */
  const logout = () => {
    localStorage.removeItem('student_reg_token');
    localStorage.removeItem('student_reg_admin');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    token,
    admin,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
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

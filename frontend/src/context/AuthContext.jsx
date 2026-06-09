import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'entitysys_token';
const USER_KEY  = 'entitysys_user';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true until initial check done

  // On mount: verify stored token is still valid
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } catch {
        // Token invalid/expired — clear everything
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const saveAuth = (tokenVal, userData) => {
    localStorage.setItem(TOKEN_KEY, tokenVal);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: t, user: u } = res.data;
    saveAuth(t, u);
    return u; // return user so caller can redirect by role
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Convenience role checkers
  const isAdmin   = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser,
      isAdmin, isFaculty, isStudent,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
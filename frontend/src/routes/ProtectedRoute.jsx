import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

// Redirects unauthenticated users to /login
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" />
        <span>Loading EntitySYS…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Restricts route to specific roles; redirects others to their dashboard
export function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!roles.includes(user?.role)) {
    const redirect = user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'faculty'
      ? '/faculty/dashboard'
      : '/student/dashboard';
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return children;
}

// Redirects already-logged-in users away from /login
export function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const redirect = user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'faculty'
      ? '/faculty/dashboard'
      : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
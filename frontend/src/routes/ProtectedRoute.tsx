import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access control
  if (requiredRole && user) {
    const userRole = user.role;
    
    // Admin can access everything
    if (userRole === 'admin') {
      return <>{children}</>;
    }
    
    // Check specific role requirements
    if (requiredRole === 'admin') {
      // Only admin can access admin routes
      return <Navigate to="/dashboard" replace />;
    }
    
    if (requiredRole === 'staff' && userRole !== 'staff') {
      // Staff routes require staff role
      return <Navigate to="/dashboard" replace />;
    }
    
    if (requiredRole === 'user' && userRole !== 'user') {
      // User routes require user role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

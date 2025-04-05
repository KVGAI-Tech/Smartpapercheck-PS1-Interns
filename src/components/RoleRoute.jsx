import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  
  if (requiredRole === 'student') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  
  if (userRole !== requiredRole) {
    switch (userRole) {
      case 'professor':
        return <Navigate to="/dashboard" replace />;
      case 'student':
        return <Navigate to="/student-dashboard" replace />;
      case 'ta':
        return <Navigate to="/ta-dashboard" replace />;
      default:
        return <Navigate to="/auth" replace />;
    }
  }

  return children;
};

export default RoleRoute;

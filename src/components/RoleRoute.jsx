import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  try {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    if (userRole !== requiredRole) {
      const redirectPaths = {
        professor: '/dashboard',
        student: '/student-dashboard',
        ta: '/ta-dashboard',
      };
      
      const redirectPath = redirectPaths[userRole] || '/auth';
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/auth" replace />;
  }
};

export default RoleRoute;
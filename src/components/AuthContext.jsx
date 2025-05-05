import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');
        
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(role);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        setAuthError('Failed to initialize authentication state');
        setIsAuthenticated(false);
        setUserRole(null);
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('refreshToken');
        } catch (clearError) {
          console.error('Failed to clear authentication data:', clearError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, role) => {
    if (!token || !role) {
      setAuthError('Login failed: Missing authentication token or role');
      return;
    }
    
    try {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserRole(role);
      setAuthError(null);
      switch (role) {
        case 'student':
          navigate('/student-dashboard', { replace: true });
          break;
        case 'professor':
          navigate('/dashboard', { replace: true });
          break;
        default:
          throw new Error(`Invalid role type: ${role}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(`Login failed: ${error.message || 'Unknown error occurred'}`);
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('refreshToken');
      } catch (clearError) {
        console.error('Failed to clear authentication data after login error:', clearError);
      }
      
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUserRole(null);
      setAuthError(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('Logout encountered an error, but you have been signed out');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/auth', { replace: true });
    }
  };
  const validateToken = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      setAuthError('Your session has expired');
      logout();
      return false;
    }
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    userRole,
    setUserRole,
    authError,
    login,
    logout,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
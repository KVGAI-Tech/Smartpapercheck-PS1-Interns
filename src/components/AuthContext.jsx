import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
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
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, role) => {
    
    if (role === 'student') {
      navigate('/student-dashboard', { replace: true });
      return;
    }

    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);

    switch (role) {
      case 'professor':
        navigate('/dashboard', { replace: true });
        break;
      case 'ta':
        navigate('/ta-dashboard', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/auth', { replace: true });
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    userRole,
    setUserRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

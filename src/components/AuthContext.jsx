import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus, setupTokenRefresh } from './auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cleanupFunction;

    const initAuth = async () => {
      const isAuthed = await checkAuthStatus();
      setIsAuthenticated(isAuthed);
      setIsLoading(false);

      if (isAuthed) {
        cleanupFunction = setupTokenRefresh();
      }
    };

    initAuth();

    return () => {
      if (typeof cleanupFunction === 'function') {
        cleanupFunction();
      }
    };
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

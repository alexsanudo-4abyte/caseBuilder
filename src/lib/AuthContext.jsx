import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      const status = err?.status ?? err?.data?.status;
      if (status === 401 || status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else {
        setAuthError({ type: 'auth_required', message: 'Please log in to continue' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  const login = async (email, password) => {
    const loggedInUser = await apiClient.auth.login(email, password);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthError(null);
    return loggedInUser;
  };

  const register = async (full_name, email, password) => {
    const loggedInUser = await apiClient.auth.register(full_name, email, password);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthError(null);
    return loggedInUser;
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      apiClient.auth.logout();
    } else {
      localStorage.removeItem('cb_access_token');
    }
  };

  const navigateToLogin = () => {
    apiClient.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        login,
        register,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

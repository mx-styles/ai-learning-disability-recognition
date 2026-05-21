import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, getStoredToken, registerUnauthorizedHandler, setApiToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken() || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout(false);
    });
    return () => registerUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setApiToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setApiToken(token);
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const response = await authAPI.me();
        if (!cancelled) {
          setUser(response.data.user || null);
        }
      } catch (error) {
        if (!cancelled) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('auth_token');
          }
          setToken('');
          setApiToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    const nextToken = response.data.token;
    const nextUser = response.data.user || null;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', nextToken);
    }
    setToken(nextToken);
    setApiToken(nextToken);
    setUser(nextUser);

    return nextUser;
  };

  const logout = async (callServer = true) => {
    if (callServer && token) {
      try {
        await authAPI.logout();
      } catch (error) {
        // Ignore logout failures; local state is still cleared.
      }
    }

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
    }
    setToken('');
    setApiToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      refreshUser: async () => {
        const response = await authAPI.me();
        setUser(response.data.user || null);
        return response.data.user || null;
      },
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

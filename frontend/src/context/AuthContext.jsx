import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

const DEFAULT_PREFERENCES = {
  email: {
    orders: true,
    payments: true,
    offers: true,
    system: true
  },
  push: {
    orders: true,
    payments: true,
    offers: true,
    system: true
  },
  inApp: {
    orders: true,
    payments: true,
    offers: true,
    system: true
  }
};

export const AuthProvider = ({ children }) => {

  // Real authentication state only
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [authLoading, setAuthLoading] = useState(true);

  // Clear authentication completely
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setPreferences(DEFAULT_PREFERENCES);

    localStorage.removeItem('sri_ramu_token');
    localStorage.removeItem('sri_ramu_user');
  }, []);

  // Validate existing token using backend
  const refreshAuth = useCallback(async (savedToken = token) => {

    if (!savedToken) {
      clearAuth();
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(
          data.message || 'Session validation failed'
        );
      }

      // Backend is the source of truth
      setToken(savedToken);
      setUser(data.user);

      if (data.preferences) {
        setPreferences(data.preferences);
      }

      localStorage.setItem('sri_ramu_token', savedToken);

      return {
        success: true,
        user: data.user
      };

    } catch (error) {

      console.error('Authentication refresh failed:', error);

      clearAuth();

      return {
        success: false,
        message: error.message
      };
    }

  }, [token, clearAuth]);

  // Restore session on page refresh
  useEffect(() => {

    let active = true;

    const initializeAuth = async () => {

      const savedToken = localStorage.getItem('sri_ramu_token');

      if (!savedToken) {
        if (active) {
          clearAuth();
          setAuthLoading(false);
        }
        return;
      }

      if (active) {
        setToken(savedToken);
      }

      await refreshAuth(savedToken);

      if (active) {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      active = false;
    };

  }, []);

  // Common API response handler
  const parseAuthResponse = async (response) => {

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server');
    }

    if (!response.ok || data.success !== true) {
      throw new Error(
        data.message || 'Authentication failed'
      );
    }

    if (!data.token || !data.user || !data.user._id) {
      throw new Error(
        'Invalid login response from server'
      );
    }

    if (!['ADMIN', 'CUSTOMER'].includes(data.user.role)) {
      throw new Error('Invalid user role received from server');
    }

    return data;
  };

  // Backend login
  const login = async (email, password) => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        }
      );

      const data = await parseAuthResponse(response);

      // Store actual backend response
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem(
        'sri_ramu_token',
        data.token
      );

      setPreferences(DEFAULT_PREFERENCES);

      return {
        success: true,
        user: data.user,
        token: data.token
      };

    } catch (error) {

      console.error('Login error:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // Backend customer registration
  const register = async (userData) => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        }
      );

      const data = await parseAuthResponse(response);

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem(
        'sri_ramu_token',
        data.token
      );

      setPreferences(DEFAULT_PREFERENCES);

      return {
        success: true,
        user: data.user,
        token: data.token
      };

    } catch (error) {

      console.error('Registration error:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // Logout
  const logout = () => {
    clearAuth();
  };

  // Update notification preferences
  const updatePreferences = async (newPrefs) => {

    if (!token) {
      return {
        success: false,
        message: 'Please login first'
      };
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newPrefs)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Preference update failed'
        );
      }

      if (data.preferences) {
        setPreferences(data.preferences);
      } else {
        setPreferences(prev => ({
          ...prev,
          ...newPrefs
        }));
      }

      return {
        success: true,
        preferences: data.preferences
      };

    } catch (error) {

      console.error('Preference update error:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        preferences,
        authLoading,
        isAuthenticated: Boolean(user && token),

        login,
        register,
        logout,
        refreshAuth,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

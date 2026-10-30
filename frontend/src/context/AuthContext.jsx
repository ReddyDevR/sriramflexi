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

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [authLoading, setAuthLoading] = useState(true);
  const [authExpired, setAuthExpired] = useState(false);

  // Clear authentication
  const clearAuth = useCallback(() => {

    setUser(null);
    setToken(null);
    setPreferences(DEFAULT_PREFERENCES);

    localStorage.removeItem('sri_ramu_token');
    localStorage.removeItem('sri_ramu_user');

  }, []);

  // Validate token with backend
  const refreshAuth = useCallback(async (savedToken) => {

    if (!savedToken) {
      clearAuth();

      return {
        success: false
      };
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.user?._id) {
        throw new Error(
          data.message || 'Session expired'
        );
      }

      if (!['ADMIN', 'CUSTOMER'].includes(data.user.role)) {
        throw new Error('Invalid user role');
      }

      setToken(savedToken);
      setUser(data.user);
      setAuthExpired(false);

      setPreferences(
        data.preferences || DEFAULT_PREFERENCES
      );

      localStorage.setItem(
        'sri_ramu_token',
        savedToken
      );

      return {
        success: true,
        user: data.user
      };

    } catch (error) {

      console.error('Token validation failed:', error);

      clearAuth();
      setAuthExpired(true);

      return {
        success: false,
        error: error.message
      };
    }

  }, [clearAuth]);

  // Validate saved token when application starts
  useEffect(() => {

    const initializeAuth = async () => {

      const savedToken = localStorage.getItem(
        'sri_ramu_token'
      );

      if (savedToken) {
        await refreshAuth(savedToken);
      } else {
        clearAuth();
      }

      setAuthLoading(false);
    };

    initializeAuth();

  }, [refreshAuth, clearAuth]);

  // Validate backend authentication response
  const validateAuthResponse = async (response) => {

    const data = await response.json();

    if (!response.ok || data.success !== true) {
      throw new Error(
        data.message || 'Authentication failed'
      );
    }

    if (
      !data.token ||
      !data.user ||
      !data.user._id ||
      !['ADMIN', 'CUSTOMER'].includes(data.user.role)
    ) {
      throw new Error(
        'Invalid authentication response from server'
      );
    }

    return data;
  };

  // Login
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

      const data = await validateAuthResponse(response);

      setUser(data.user);
      setToken(data.token);
      setAuthExpired(false);

      setPreferences(DEFAULT_PREFERENCES);

      localStorage.setItem(
        'sri_ramu_token',
        data.token
      );

      return {
        success: true,
        user: data.user
      };

    } catch (error) {

      console.error('Login error:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // Customer registration
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

      const data = await validateAuthResponse(response);

      setUser(data.user);
      setToken(data.token);
      setAuthExpired(false);

      setPreferences(DEFAULT_PREFERENCES);

      localStorage.setItem(
        'sri_ramu_token',
        data.token
      );

      return {
        success: true,
        user: data.user
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
    setAuthExpired(false);

  };

  // Update notification preferences
  const updatePreferences = async (newPrefs) => {

    if (!token) {
      return {
        success: false,
        error: 'Please login first'
      };
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
      }

      return {
        success: true,
        preferences: data.preferences
      };

    } catch (error) {

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
        authExpired,

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

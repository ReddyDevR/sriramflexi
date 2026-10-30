import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);

  const [token, setToken] = useState(
  () => localStorage.getItem('sri_ramu_token') || null
);
  const [preferences, setPreferences] = useState({
    email: { orders: true, payments: true, offers: true, system: true },
    push: { orders: true, payments: true, offers: true, system: true },
    inApp: { orders: true, payments: true, offers: true, system: true }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sri_ramu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sri_ramu_user');
    }
  }, [user]);

  
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('sri_ramu_token', data.token);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('sri_ramu_token', data.token);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sri_ramu_token');
    localStorage.removeItem('sri_ramu_user');
  };

  const updatePreferences = async (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newPrefs)
        });
      } catch (e) {
        console.error('Failed to sync preferences', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      preferences,
      switchRole,
      login,
      register,
      logout,
      updatePreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sri_ramu_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    // Default to sample Customer for initial view, switchable anytime
    return {
      _id: 'user_cust_001',
      name: 'Maheswar Reddy',
      email: 'maheswar@gmail.com',
      role: 'CUSTOMER',
      phone: '+91 94401 56789',
      company: 'Reddy Agro Tech',
      address: 'Shop #12, Market Yard, Guntur, AP'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('sri_ramu_token') || 'demo_token');
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

  // Switch role helper for live testing
  const switchRole = (newRole) => {
    if (newRole === 'ADMIN') {
      const adminUser = {
        _id: 'user_admin_001',
        name: 'Ramu S. (Managing Director)',
        email: 'admin@sriramuprinting.com',
        role: 'ADMIN',
        phone: '+91 98480 12345',
        company: 'Sri Ramu Digital Press'
      };
      setUser(adminUser);
    } else {
      const custUser = {
        _id: 'user_cust_001',
        name: 'Maheswar Reddy',
        email: 'maheswar@gmail.com',
        role: 'CUSTOMER',
        phone: '+91 94401 56789',
        company: 'Reddy Agro Tech',
        address: 'Shop #12, Market Yard, Guntur, AP'
      };
      setUser(custUser);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
      const res = await fetch('http://localhost:5000/api/auth/register', {
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
        await fetch('http://localhost:5000/api/auth/preferences', {
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

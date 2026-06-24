import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const message = validationErrors 
        ? validationErrors.map(e => e.msg).join(', ') 
        : (err.response?.data?.message || 'Registration failed.');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (token) fetchCurrentUser();
    else setLoading(false);
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) setUser(response.user);
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true, data: response };
      }
      setError(response.message || 'Registration failed');
      return { success: false, error: response.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred during registration';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true, data: response };
      }
      setError(response.message || 'Login failed');
      return { success: false, error: response.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred during login';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // optional: let any component refresh the user from the server
  const refreshUser = () => fetchCurrentUser();

  const value = {
    user, token, loading, error,
    isAuthenticated: !!token,
    register, login, logout, updateUser, refreshUser, setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
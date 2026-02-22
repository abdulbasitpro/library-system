import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — fetch current user
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const register = async (formData) => {
    const { data } = await axiosInstance.post('/auth/register', formData);
    setUser(data.user);
    return data;
  };

  const login = async (formData) => {
    const { data } = await axiosInstance.post('/auth/login', formData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await axiosInstance.get('/auth/logout');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const { data } = await axiosInstance.put('/auth/me', formData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

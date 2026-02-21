import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — verify token with server (not just localStorage)
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        // Always verify with server so deleted users get logged out
        const { data } = await API.get('/auth/me');
        const u = { ...data.user, levelInfo: getLevelInfo(data.user.xp) };
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      } catch (e) {
        // Token invalid or user deleted
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    const u = { ...data.user, levelInfo: getLevelInfo(data.user.xp) };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    const u = { ...data.user, levelInfo: getLevelInfo(data.user.xp) };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me');
      const u = { ...data.user, levelInfo: getLevelInfo(data.user.xp) };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    } catch (e) { return null; }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper — compute level info from XP
function getLevelInfo(xp = 0) {
  if (xp < 100)  return { level: 1, title: 'مبتدئ' };
  if (xp < 300)  return { level: 2, title: 'متعلم' };
  if (xp < 600)  return { level: 3, title: 'متقدم' };
  if (xp < 1000) return { level: 4, title: 'محترف' };
  if (xp < 2000) return { level: 5, title: 'خبير' };
  return { level: 6, title: 'أسطورة' };
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setMe(null);
      setLoading(false);
      return null;
    }
    try {
      const emp = await api.get('/api/auth/me');
      setMe(emp);
      return emp;
    } catch {
      clearToken();
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (phone, password) => {
    const { token, employee } = await api.post('/api/auth/login', { phone, password });
    setToken(token);
    setMe(employee);
    return employee;
  };

  const register = async (form) => {
    const { token, employee } = await api.post('/api/auth/register', form);
    setToken(token);
    setMe(employee);
    return employee;
  };

  const logout = () => {
    clearToken();
    setMe(null);
  };

  const can = {
    // Старший ведёт смены и видит выработку, деньги — только у руководителя.
    manageShifts: me?.role === 'admin' || me?.role === 'senior',
    manageCrew: me?.role === 'admin',
    seeMoney: me?.role === 'admin',
  };

  return (
    <AuthCtx.Provider value={{ me, setMe, loading, login, register, logout, refresh, can }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Restore from storage
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  async function fetchProfile() {
    try {
      const json = await apiFetch('/api/user/me');
      if (json && json.success) {
        setProfile(json.user);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }

  const api = useMemo(() => ({
    async signup(name, email, password) {
      const json = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      setUser(json.user);
      setToken(json.token);
      localStorage.setItem('auth_token', json.token);
      localStorage.setItem('auth_user', JSON.stringify(json.user));
      await fetchProfile();
      return json.user;
    },
    async login(email, password) {
      const json = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      setUser(json.user);
      setToken(json.token);
      localStorage.setItem('auth_token', json.token);
      localStorage.setItem('auth_user', JSON.stringify(json.user));
      await fetchProfile();
      return json.user;
    },
    async logout() {
      try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
      setUser(null);
      setToken(null);
      setProfile(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    async refreshProfile() { await fetchProfile(); },
  }), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, profile, ...api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



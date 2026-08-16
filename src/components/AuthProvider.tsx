'use client';

import { api, User } from '@/lib/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  token: string | null;
  welcomeCredentials: { username: string; password: string } | null;
  setSession: (token: string, user: User) => void;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [welcomeCredentials, setWelcomeCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.me(stored);
      setToken(stored);
      setUser(me);
      if (me.welcomePassword) {
        setWelcomeCredentials({ username: me.username, password: me.welcomePassword });
      }
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = useCallback((accessToken: string, nextUser: User) => {
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(nextUser);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setWelcomeCredentials(null);
    router.push('/');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, token, welcomeCredentials, setSession, refresh, logout }),
    [user, loading, token, welcomeCredentials, setSession, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

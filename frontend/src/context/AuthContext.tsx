import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, getToken, setToken, setMfaToken } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
  completeMfa: (code: number) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.mfaRequired && res.mfaToken) {
      setMfaToken(res.mfaToken);
      return { mfaRequired: true };
    }
    setToken(res.accessToken!);
    setIsAuthenticated(true);
    return { mfaRequired: false };
  }, []);

  const completeMfa = useCallback(async (code: number) => {
    const mfaToken = sessionStorage.getItem('mfaToken');
    if (!mfaToken) throw new Error('MFA session expired');
    const res = await api.mfaLogin({ mfaToken, code });
    setToken(res.accessToken);
    setMfaToken(null);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    setToken(res.accessToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setMfaToken(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, completeMfa, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

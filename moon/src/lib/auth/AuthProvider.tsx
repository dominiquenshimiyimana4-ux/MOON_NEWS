"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import {
  authService,
  readStoredUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/services/authService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  login: (p: LoginPayload) => Promise<User>;
  register: (p: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setHydrated(true);
  }, []);

  const login = useCallback(async (p: LoginPayload) => {
    setLoading(true);
    try {
      const { user } = await authService.login(p);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (p: RegisterPayload) => {
    setLoading(true);
    try {
      const { user } = await authService.register(p);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, hydrated, login, register, logout }),
    [user, loading, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

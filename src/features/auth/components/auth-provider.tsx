"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../index";
import type { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (
    data: import("../types").LoginInput,
  ) => Promise<import("../types").AuthResponse>;
  register: (
    data: import("../types").RegisterInput,
  ) => Promise<import("../types").AuthResponse>;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: import("../types").LoginInput) => {
    const response = await authService.login(data);
    setUser(response.user);
    return response;
  };

  const register = async (data: import("../types").RegisterInput) => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

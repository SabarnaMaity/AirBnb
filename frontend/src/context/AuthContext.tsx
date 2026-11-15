"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, USERROLE } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUserManually: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  refreshUser: async () => {},
  setUserManually: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("airbnb_auth_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        // Refresh latest data from backend in background
        if (parsed._id) {
          api.getUserById(parsed._id).then((res) => {
            if (res.success && res.data) {
              setUser(res.data);
              localStorage.setItem("airbnb_auth_user", JSON.stringify(res.data));
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    const res = await api.login(credentials);
    setLoading(false);

    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem("airbnb_auth_user", JSON.stringify(res.data));
      return { success: true };
    }
    return { success: false, message: res.message || "Invalid credentials" };
  };

  const register = async (userData: any) => {
    setLoading(true);
    const res = await api.register(userData);
    setLoading(false);

    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem("airbnb_auth_user", JSON.stringify(res.data));
      return { success: true };
    }
    return { success: false, message: res.message || "Registration failed" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("airbnb_auth_user");
  };

  const refreshUser = async () => {
    if (!user?._id) return;
    const res = await api.getUserById(user._id);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem("airbnb_auth_user", JSON.stringify(res.data));
    }
  };

  const setUserManually = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("airbnb_auth_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("airbnb_auth_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setUserManually,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

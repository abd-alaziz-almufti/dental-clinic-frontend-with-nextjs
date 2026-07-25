"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { token: authToken, user: userData } = res.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, errorCode: res.error_code || "UNAUTHENTICATED", message: res.message };
      }
    } catch (err) {
      const errorCode = err.response?.data?.error_code || "UNAUTHENTICATED";
      const message = err.response?.data?.message || err.message;
      return { success: false, errorCode, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoading(false);
    }
  };

  // Authority check helper: accepts role name string or array of roles
  const can = useCallback(
    (requiredRoles) => {
      if (!user || !user.roles) return false;

      // super-admin has full override authority
      if (user.roles.includes("super-admin")) return true;

      if (Array.isArray(requiredRoles)) {
        return requiredRoles.some((role) => user.roles.includes(role));
      }
      return user.roles.includes(requiredRoles);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

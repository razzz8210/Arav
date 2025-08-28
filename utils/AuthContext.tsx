"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name?: string | null;
  prismaId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setAuthenticated(data.authenticated);
    } catch {
      setAuthenticated(false);
    }
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);


  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      // User is authenticated via NextAuth
      const nextAuthUser: User = {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || null,
        prismaId: (session.user as any).prismaId || null,
      };
      setUser(nextAuthUser);
      setLoading(false);
    } else if (status === "unauthenticated") {
      // Check for legacy JWT auth
      checkLegacyAuth();
    }
  }, [session, status]);


  const checkLegacyAuth = async () => {
    try {
      const response = await fetch("/api/user/me");

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Legacy auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // If using NextAuth session, sign out
      if (session) {
        await signOut({ redirect: false });
        setAuthenticated(false);
        setUser(null);
      } else {
        // Call legacy logout API
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        setAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, logout, updateUser, authenticated: false }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

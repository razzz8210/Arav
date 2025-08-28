"use client";

import { useAuth } from "@/utils/AuthContext";

export const AuthDebug = () => {
  const { user, authenticated, loading } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {authenticated ? 'true' : 'false'}</div>
      <div>User ID: {user?.id || 'null'}</div>
      <div>Email: {user?.email || 'null'}</div>
      <div>Name: {user?.name || 'null'}</div>
    </div>
  );
};
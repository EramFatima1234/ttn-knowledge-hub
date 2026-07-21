"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { refreshSession } from "@/lib/auth-api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated, isAuthenticated, setSession, logout } = useAuthStore();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    refreshSession()
      .then((data) => {
        setSession({
          ...data.user,
          accessToken: data.accessToken,
        });
      })
      .catch(() => {
        logout();
      });
  }, [isHydrated, isAuthenticated, setSession, logout]);

  return <>{children}</>;
}

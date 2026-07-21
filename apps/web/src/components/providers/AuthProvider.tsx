"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { refreshSession } from "@/lib/auth-api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated, isAuthenticated, setSession, logout, setHydrated } =
    useAuthStore();

  // Ensure persist hydration cannot leave the app on an infinite loading spinner
  // (e.g. corrupted localStorage or dev server restarts mid-hydration).
  useEffect(() => {
    const markHydrated = () => setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(markHydrated);
    if (useAuthStore.persist.hasHydrated()) {
      markHydrated();
    }
    const fallback = window.setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) {
        markHydrated();
      }
    }, 2000);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, [setHydrated]);

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

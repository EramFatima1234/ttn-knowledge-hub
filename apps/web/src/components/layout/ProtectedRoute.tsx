"use client";

import { RoleName } from "@knowledgehub/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isHydrated, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles?.length) {
      const hasAccess = allowedRoles.some((role) => hasRole(role));
      if (!hasAccess) {
        router.replace("/");
      }
    }
  }, [
    isAuthenticated,
    isHydrated,
    router,
    pathname,
    allowedRoles,
    hasRole,
  ]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (allowedRoles?.length && !allowedRoles.some((role) => hasRole(role))) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}

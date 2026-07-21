"use client";

import { RoleName } from "@knowledgehub/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { demoAllowsAdminAccess } from "@/lib/demo-access";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

function hasAllowedRole(
  allowedRoles: RoleName[] | undefined,
  isAuthenticated: boolean,
  hasRole: (role: RoleName) => boolean,
): boolean {
  if (!allowedRoles?.length) return true;

  // TODO(demo): Remove when DEMO_OPEN_ADMIN_ACCESS is false (production RBAC).
  if (demoAllowsAdminAccess(isAuthenticated) && allowedRoles.includes(RoleName.ADMIN)) {
    return true;
  }

  return allowedRoles.some((role) => hasRole(role));
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isHydrated, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const canAccess = hasAllowedRole(allowedRoles, isAuthenticated, hasRole);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!canAccess) {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, router, pathname, canAccess]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}

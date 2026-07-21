import { RoleName } from "@knowledgehub/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.TEAM]}>
      {children}
    </ProtectedRoute>
  );
}

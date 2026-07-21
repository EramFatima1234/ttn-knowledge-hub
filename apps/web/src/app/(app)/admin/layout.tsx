import { RoleName } from "@knowledgehub/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[RoleName.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}

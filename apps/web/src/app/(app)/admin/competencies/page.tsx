import { redirect } from "next/navigation";

export default function AdminCompetenciesPage() {
  redirect("/admin/catalog?tab=competencies");
}

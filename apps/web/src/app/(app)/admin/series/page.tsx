import { redirect } from "next/navigation";

export default function AdminSeriesPage() {
  redirect("/admin/content?tab=series");
}

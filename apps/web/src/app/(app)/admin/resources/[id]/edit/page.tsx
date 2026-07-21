import { redirect } from "next/navigation";

export default function AdminResourceEditPage() {
  redirect("/admin/content?tab=meets");
}

import { redirect } from "next/navigation";

export default function AdminResourceCreatePage() {
  redirect("/admin/content?tab=meets");
}

import { redirect } from "next/navigation";

export default function AdminMeetsPage() {
  redirect("/admin/content?tab=meets");
}

import { redirect } from "next/navigation";

export default function AdminSpeakersPage() {
  redirect("/admin/catalog?tab=speakers");
}

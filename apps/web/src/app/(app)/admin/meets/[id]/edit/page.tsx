"use client";

import { use } from "react";
import MeetFormPage from "@/features/admin-cms/meets/MeetFormPage";

export default function AdminMeetEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MeetFormPage meetId={id} />;
}

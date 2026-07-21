"use client";

import { use } from "react";
import SpeakerFormPage from "@/features/admin-cms/speakers/SpeakerFormPage";

export default function AdminSpeakerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SpeakerFormPage speakerId={id} />;
}

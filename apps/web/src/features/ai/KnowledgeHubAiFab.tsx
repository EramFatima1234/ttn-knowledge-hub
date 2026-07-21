"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AiFloatingLauncher from "@/features/ai/AiFloatingLauncher";
import { useAiDrawerStore } from "@/store/useAiDrawerStore";

const KnowledgeHubAiDrawer = dynamic(
  () => import("@/features/ai/KnowledgeHubAiDrawer"),
  { ssr: false },
);

export default function KnowledgeHubAiFab() {
  const open = useAiDrawerStore((s) => s.open);
  const [loadDrawer, setLoadDrawer] = useState(false);

  useEffect(() => {
    if (open) setLoadDrawer(true);
  }, [open]);

  return (
    <>
      <AiFloatingLauncher />
      {loadDrawer && <KnowledgeHubAiDrawer />}
    </>
  );
}

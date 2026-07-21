"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "pause" | "deleting";

export function useRotatingTypewriter(
  messages: readonly string[],
  options?: {
    typeMs?: number;
    deleteMs?: number;
    pauseMs?: number;
  },
) {
  const typeMs = options?.typeMs ?? 38;
  const deleteMs = options?.deleteMs ?? 22;
  const pauseMs = options?.pauseMs ?? 1800;

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (!messages.length) return;
    const full = messages[index % messages.length];

    if (phase === "typing") {
      if (text.length < full.length) {
        const t = window.setTimeout(() => setText(full.slice(0, text.length + 1)), typeMs);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => setPhase("pause"), pauseMs);
      return () => window.clearTimeout(t);
    }

    if (phase === "pause") {
      const t = window.setTimeout(() => setPhase("deleting"), 400);
      return () => window.clearTimeout(t);
    }

    if (text.length > 0) {
      const t = window.setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      return () => window.clearTimeout(t);
    }

    setIndex((i) => (i + 1) % messages.length);
    setPhase("typing");
  }, [messages, index, text, phase, typeMs, deleteMs, pauseMs]);

  return { text, showCursor: phase !== "pause" || text.length > 0 };
}

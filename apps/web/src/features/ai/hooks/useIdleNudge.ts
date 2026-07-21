"use client";

import { useEffect, useState } from "react";

export function useIdleNudge(enabled = true) {
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      setNudge(true);
      window.setTimeout(() => setNudge(false), 1400);
    }, 22_000 + Math.random() * 8_000);

    return () => window.clearInterval(interval);
  }, [enabled]);

  return nudge;
}

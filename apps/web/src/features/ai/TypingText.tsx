"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  text,
  active = true,
  speedMs = 12,
}: {
  text: string;
  active?: boolean;
  speedMs?: number;
}) {
  const [visible, setVisible] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setVisible(text);
      return;
    }
    setVisible("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [text, active, speedMs]);

  return <span className="kh-ai-typing">{visible}</span>;
}

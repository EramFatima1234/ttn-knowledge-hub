"use client";

import { motion } from "framer-motion";
import { AI_PILL_SUGGESTIONS } from "@/features/ai/constants";
import { useRotatingTypewriter } from "@/features/ai/hooks/useRotatingTypewriter";

export default function AiSuggestionPill({
  onOpen,
  nudge,
}: {
  onOpen: () => void;
  nudge?: boolean;
}) {
  const { text, showCursor } = useRotatingTypewriter(AI_PILL_SUGGESTIONS);

  return (
    <motion.button
      type="button"
      className={`kh-ai-pill${nudge ? " kh-ai-pill--nudge" : ""}`}
      onClick={onOpen}
      aria-label="Open KnowledgeHub AI assistant"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <span className="kh-ai-pill__shine" aria-hidden />
      <span className="kh-ai-pill__text">
        {text}
        {showCursor && <span className="kh-ai-pill__cursor" aria-hidden />}
      </span>
      <span className="kh-ai-pill__meta">✨ Powered by KnowledgeHub AI</span>
    </motion.button>
  );
}

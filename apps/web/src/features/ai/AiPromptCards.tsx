"use client";

import { motion } from "framer-motion";
import { AI_PROMPT_CARDS } from "@/features/ai/constants";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { stiffness: 380, damping: 28 },
  },
};

export default function AiPromptCards({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <motion.div className="kh-ai-prompt-grid" variants={container} initial="hidden" animate="show">
      {AI_PROMPT_CARDS.map((card) => (
        <motion.button
          key={card.label}
          type="button"
          className="kh-ai-prompt-card"
          variants={item}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(card.prompt)}
        >
          <span className="kh-ai-prompt-card__emoji">{card.emoji}</span>
          <span className="kh-ai-prompt-card__label">{card.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}

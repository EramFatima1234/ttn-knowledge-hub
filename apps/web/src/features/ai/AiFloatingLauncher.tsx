"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { RobotOutlined } from "@ant-design/icons";
import AiSuggestionPill from "@/features/ai/AiSuggestionPill";
import { useIdleNudge } from "@/features/ai/hooks/useIdleNudge";
import { useAiDrawerStore } from "@/store/useAiDrawerStore";

export default function AiFloatingLauncher() {
  const setOpen = useAiDrawerStore((s) => s.setOpen);
  const nudge = useIdleNudge(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "0px" });
  const [pageVisible, setPageVisible] = useState(true);
  const [hoverCard, setHoverCard] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const animateFab = inView && pageVisible;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 280, damping: 22 });
  const sy = useSpring(my, { stiffness: 280, damping: 22 });

  const openDrawer = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set((e.clientX - cx) * 0.08);
    my.set((e.clientY - cy) * 0.08);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
    setHoverCard(false);
  };

  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      key: Date.now(),
    });
    openDrawer();
  };

  return (
    <div
      ref={wrapRef}
      className="kh-ai-launcher"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <AiSuggestionPill onOpen={openDrawer} nudge={nudge} />

      <AnimatePresence>
        {hoverCard && (
          <motion.div
            className="kh-ai-hover-card"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <p className="kh-ai-hover-card__eyebrow">✨ KnowledgeHub AI</p>
            <h3>Your Personal Learning Assistant</h3>
            <ul>
              <li>Ask questions naturally.</li>
              <li>Find learning content.</li>
              <li>Summarize sessions.</li>
              <li>Generate quizzes.</li>
              <li>Discover learning paths.</li>
            </ul>
            <button type="button" className="kh-ai-hover-card__cta" onClick={openDrawer}>
              Start Chat →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className={`kh-ai-launcher__btn${nudge ? " kh-ai-launcher__btn--nudge" : ""}`}
        style={{ x: sx, y: sy }}
        onClick={onButtonClick}
        onMouseEnter={() => setHoverCard(true)}
        onFocus={() => setHoverCard(true)}
        aria-label="Open KnowledgeHub AI"
        animate={animateFab ? { y: [0, -5, 0] } : { y: 0 }}
        transition={
          animateFab
            ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <span className="kh-ai-launcher__btn-glow" aria-hidden />
        <span className="kh-ai-launcher__btn-ring" aria-hidden />
        <RobotOutlined className="kh-ai-launcher__btn-icon" />
        {ripple && (
          <span
            key={ripple.key}
            className="kh-ai-launcher__ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        )}
      </motion.button>
    </div>
  );
}

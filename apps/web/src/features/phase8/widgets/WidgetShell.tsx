"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface WidgetShellProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  loading?: boolean;
}

export default function WidgetShell({
  title,
  action,
  children,
  className = "",
  delay = 0,
}: WidgetShellProps) {
  return (
    <motion.section
      className={`kh-p8-widget ${className}`.trim()}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {(title || action) && (
        <div className="kh-p8-widget__header">
          {title && <h3 className="kh-p8-widget__title">{title}</h3>}
          {action}
        </div>
      )}
      <div className="kh-p8-widget__body">{children}</div>
    </motion.section>
  );
}

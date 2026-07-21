"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

interface QuickActionCardProps {
  action: QuickAction;
  delay?: number;
}

export default function QuickActionCard({ action, delay = 0 }: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
    >
      <Link href={action.href} className="kh-p8-quick-action">
        <span className="kh-p8-quick-action__icon">{action.icon}</span>
        <div>
          <strong>{action.title}</strong>
          <p>{action.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

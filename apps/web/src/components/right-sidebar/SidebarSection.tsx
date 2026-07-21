"use client";

import { Alert, Skeleton } from "antd";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  action?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  skeletonRows?: number;
  className?: string;
  delay?: number;
  /** When true, renders only body content (for accordion panels). */
  contentOnly?: boolean;
}

export default function SidebarSection({
  title,
  icon,
  children,
  action,
  isLoading,
  isError,
  onRetry,
  skeletonRows = 3,
  className = "",
  delay = 0,
  contentOnly = false,
}: SidebarSectionProps) {
  const body = (
    <>
      {isLoading && (
        <div className="kh-rs-section__skeleton">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 1 }} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Alert
          type="error"
          showIcon
          title="Unable to load"
          action={
            onRetry ? (
              <button type="button" className="kh-rs-section__retry" onClick={onRetry}>
                Retry
              </button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && children}
    </>
  );

  if (contentOnly) {
    return <div className={`kh-rs-section kh-rs-section--content-only ${className}`.trim()}>{body}</div>;
  }

  return (
    <motion.section
      className={`kh-rs-section ${className}`.trim()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <div className="kh-rs-section__header">
        <h2 className="kh-rs-section__title">
          {icon && <span className="kh-rs-section__icon">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>

      {body}
    </motion.section>
  );
}

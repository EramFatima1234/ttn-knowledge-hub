"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AspireButton from "@/components/ui/AspireButton";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  extra?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  extra,
  backHref,
  backLabel = "Back",
}: AdminPageHeaderProps) {
  return (
    <div className="kh-cms-header">
      <div className="kh-cms-header__main">
        <div className="kh-cms-header__title-row">
          {backHref && (
            <Link href={backHref} className="kh-cms-back" aria-label={backLabel}>
              <ArrowLeftOutlined />
            </Link>
          )}
          <div className="kh-cms-header__title-block">
            <h1 className="inner_heading pink-border">{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>
      </div>

      <div className="kh-cms-header__actions">
        {extra}
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <AspireButton aspireVariant="primary">{actionLabel}</AspireButton>
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <AspireButton aspireVariant="primary" onClick={onAction}>
            {actionLabel}
          </AspireButton>
        )}
      </div>
    </div>
  );
}

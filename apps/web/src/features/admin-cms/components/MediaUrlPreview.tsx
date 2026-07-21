"use client";

import { FilePdfOutlined } from "@ant-design/icons";
import {
  detectMediaProvider,
  filenameFromUrl,
  getEmbedKind,
  isValidHttpUrl,
  toEmbedSrc,
} from "@/lib/media-url";
import type { CmsUrlPreviewMode } from "./CmsUrlField";

interface MediaUrlPreviewProps {
  url?: string | null;
  mode?: CmsUrlPreviewMode;
}

export default function MediaUrlPreview({ url, mode = "auto" }: MediaUrlPreviewProps) {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return null;

  if (!isValidHttpUrl(trimmed)) {
    return <p className="kh-cms-url-preview kh-cms-url-preview--error">Enter a valid http(s) URL.</p>;
  }

  const provider = detectMediaProvider(trimmed);
  const effective =
    mode === "image"
      ? "image"
      : mode === "video"
        ? provider === "embed" || provider === "direct-video"
          ? provider
          : "unknown"
        : mode === "pdf"
          ? "pdf"
          : provider;

  if (effective === "image") {
    return (
      <div className="kh-cms-url-preview kh-cms-url-preview--image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trimmed} alt="" />
      </div>
    );
  }

  if (effective === "embed") {
    const embedSrc = toEmbedSrc(trimmed);
    if (embedSrc) {
      return (
        <div className="kh-cms-url-preview kh-cms-url-preview--embed">
          <iframe
            src={embedSrc}
            title="Media preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <p className="kh-cms-url-preview kh-cms-url-preview--hint">
        Embed preview unavailable for this host ({getEmbedKind(trimmed)}).
      </p>
    );
  }

  if (effective === "direct-video") {
    return (
      <div className="kh-cms-url-preview kh-cms-url-preview--video">
        <video controls preload="metadata" src={trimmed} />
      </div>
    );
  }

  if (effective === "pdf") {
    return (
      <div className="kh-cms-url-preview kh-cms-url-preview--pdf">
        <FilePdfOutlined />
        <span>{filenameFromUrl(trimmed)}</span>
        <a href={trimmed} target="_blank" rel="noreferrer">
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <p className="kh-cms-url-preview kh-cms-url-preview--hint">
      URL looks valid. Preview is not available for this file type.
    </p>
  );
}

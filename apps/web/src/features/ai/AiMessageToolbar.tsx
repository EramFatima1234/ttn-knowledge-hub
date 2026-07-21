"use client";

import { message } from "antd";
import {
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

export default function AiMessageToolbar({
  text,
  onRegenerate,
}: {
  text: string;
  onRegenerate?: () => void;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Copied");
    } catch {
      message.error("Could not copy");
    }
  };

  return (
    <div className="kh-ai-msg-toolbar">
      <button type="button" aria-label="Copy response" onClick={copy}>
        <CopyOutlined />
      </button>
      <button type="button" aria-label="Helpful" onClick={() => message.info("Thanks for the feedback")}>
        <LikeOutlined />
      </button>
      <button type="button" aria-label="Not helpful" onClick={() => message.info("Thanks for the feedback")}>
        <DislikeOutlined />
      </button>
      {onRegenerate && (
        <button type="button" aria-label="Regenerate" onClick={onRegenerate}>
          <ReloadOutlined />
        </button>
      )}
    </div>
  );
}

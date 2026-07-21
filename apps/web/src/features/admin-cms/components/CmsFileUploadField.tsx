"use client";

import { useState } from "react";
import { Tooltip, Upload, message } from "antd";
import {
  CheckCircleFilled,
  CloseOutlined,
  CloudUploadOutlined,
  FileOutlined,
  PictureOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { uploadFile } from "@/hooks/useAdmin";
import type { StorageCategory } from "@/lib/upload";

export type CmsUploadPreview = "banner" | "thumbnail" | "video" | "file";

interface CmsFileUploadFieldProps {
  label: string;
  category: StorageCategory;
  value?: string | null;
  onChange?: (url: string) => void;
  onClear?: () => void;
  accept?: string;
  required?: boolean;
  preview?: CmsUploadPreview;
}

function fieldIcon(preview: CmsUploadPreview) {
  switch (preview) {
    case "video":
      return <PlayCircleOutlined />;
    case "file":
      return <FileOutlined />;
    case "banner":
    case "thumbnail":
    default:
      return <PictureOutlined />;
  }
}

export default function CmsFileUploadField({
  label,
  category,
  value,
  onChange,
  onClear,
  accept,
  required = false,
  preview = "thumbnail",
}: CmsFileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const hasValue = Boolean(value?.trim());

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, category);
      onChange?.(url);
      messageApi.success(`${label} uploaded`);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClear?.();
    onChange?.("");
  };

  return (
    <div className={`kh-cms-upload-field kh-cms-upload-field--icon kh-cms-upload-field--${preview}`}>
      {contextHolder}
      <div className={`kh-cms-upload-field__tile${hasValue ? " kh-cms-upload-field__tile--done" : ""}`}>
        <div className="kh-cms-upload-field__icon-wrap" aria-hidden>
          {hasValue ? <CheckCircleFilled /> : fieldIcon(preview)}
        </div>

        <div className="kh-cms-upload-field__info">
          <span className="kh-cms-upload-field__label">
            {label}
            {required && <span className="kh-cms-upload-field__required"> *</span>}
          </span>
          <span className="kh-cms-upload-field__status">
            {hasValue ? "File ready — preview on published page" : "No file uploaded yet"}
          </span>
        </div>

        <div className="kh-cms-upload-field__actions">
          <Upload
            beforeUpload={handleUpload}
            maxCount={1}
            accept={accept}
            showUploadList={false}
          >
            <Tooltip title={hasValue ? `Replace ${label}` : `Upload ${label}`}>
              <button
                type="button"
                className="kh-cms-upload-field__icon-btn"
                disabled={uploading}
                aria-label={hasValue ? `Replace ${label}` : `Upload ${label}`}
              >
                <CloudUploadOutlined spin={uploading} />
              </button>
            </Tooltip>
          </Upload>

          {hasValue && (
            <Tooltip title={`Remove ${label}`}>
              <button
                type="button"
                className="kh-cms-upload-field__icon-btn kh-cms-upload-field__icon-btn--clear"
                onClick={handleClear}
                aria-label={`Remove ${label}`}
              >
                <CloseOutlined />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import { isValidHttpUrl } from "@/lib/media-url";
import MediaUrlPreview from "./MediaUrlPreview";

export type CmsUrlPreviewMode = "image" | "video" | "pdf" | "auto";

interface CmsUrlFieldProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  previewMode?: CmsUrlPreviewMode;
  placeholder?: string;
}

export function cmsUrlRules(required?: boolean): Rule[] {
  const rules: Rule[] = [];
  if (required) {
    rules.push({ required: true, message: "URL is required" });
  }
  rules.push({
    validator: async (_, value) => {
      if (!value || !String(value).trim()) return;
      if (!isValidHttpUrl(String(value))) {
        throw new Error("Enter a valid http(s) URL");
      }
    },
  });
  return rules;
}

export default function CmsUrlField({
  name,
  label,
  required,
  helperText,
  previewMode = "auto",
  placeholder,
}: CmsUrlFieldProps) {
  return (
    <>
      <Form.Item
        name={name}
        label={label}
        rules={cmsUrlRules(required)}
        extra={helperText}
        className="kh-cms-url-field"
      >
        <Input placeholder={placeholder ?? "https://"} />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, next) => prev[name] !== next[name]}>
        {({ getFieldValue }) => (
          <MediaUrlPreview url={getFieldValue(name)} mode={previewMode} />
        )}
      </Form.Item>
    </>
  );
}

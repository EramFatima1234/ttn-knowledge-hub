"use client";

import { Button, ButtonProps } from "antd";

export type AspireButtonVariant = "primary" | "secondary";

export interface AspireButtonProps extends Omit<ButtonProps, "variant"> {
  aspireVariant?: AspireButtonVariant;
}

export default function AspireButton({
  aspireVariant = "primary",
  className = "",
  type,
  ...props
}: AspireButtonProps) {
  const variantClass =
    aspireVariant === "primary" ? "primaryButton" : "secondaryButton";

  return (
    <Button
      {...props}
      type={type ?? (aspireVariant === "primary" ? "primary" : "default")}
      className={`${variantClass} aspire-h40 ${className}`.trim()}
    />
  );
}

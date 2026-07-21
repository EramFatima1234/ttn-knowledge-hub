"use client";

import { Modal, ModalProps } from "antd";

export default function AspireModal({
  okButtonProps,
  cancelButtonProps,
  centered = true,
  ...props
}: ModalProps) {
  return (
    <Modal
      centered={centered}
      {...props}
      okButtonProps={{
        className: "primaryButton aspire-h45",
        ...okButtonProps,
      }}
      cancelButtonProps={{
        className: "secondaryButton aspire-h45",
        ...cancelButtonProps,
      }}
    />
  );
}

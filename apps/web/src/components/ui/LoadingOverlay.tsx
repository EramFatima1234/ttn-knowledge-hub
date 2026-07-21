import React from "react";
import { Spin } from "antd";

interface LoadingOverlayProps {
  isLoading: boolean;
  tip?: string;
  children?: React.ReactNode;
}

export default function LoadingOverlay({
  isLoading,
  tip = "Loading...",
  children,
}: LoadingOverlayProps) {
  if (!isLoading && !children) return null;

  if (!children) {
    return isLoading ? (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spin size="large" />
        {tip && <div className="mt-4 font-medium">{tip}</div>}
      </div>
    ) : null;
  }

  return (
    <Spin spinning={isLoading} tip={tip} size="large" className="min-h-[100px]">
      {children}
    </Spin>
  );
}

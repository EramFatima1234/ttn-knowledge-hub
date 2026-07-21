"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Layout } from "antd";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppHeader from "@/components/layout/Header";
import AppSidebar from "@/components/layout/AppSidebar";
import AppRightPanel from "@/components/layout/AppRightPanel";

const MiniPlayer = dynamic(() => import("@/components/video/MiniPlayer"), {
  ssr: false,
});

const KnowledgeHubAiFab = dynamic(
  () => import("@/features/ai/KnowledgeHubAiFab"),
  { ssr: false },
);

const { Content } = Layout;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Layout className="min-h-screen">
        <AppHeader />
        <Layout className="layout_container layout_container--three-col">
          <AppSidebar />
          <Content className="main_content">{children}</Content>
        </Layout>
        <AppRightPanel />
        <MiniPlayer />
        <KnowledgeHubAiFab />
      </Layout>
    </ProtectedRoute>
  );
}

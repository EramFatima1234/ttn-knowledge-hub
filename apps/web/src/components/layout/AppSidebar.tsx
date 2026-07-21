"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  CalendarOutlined,
  CompassOutlined,
  HomeOutlined,
  PlaySquareOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { MenuProps } from "antd";

const { Sider } = Layout;

function resolveAdminSelectedKey(pathname: string, tab: string | null): string {
  if (
    pathname.startsWith("/admin/content") ||
    pathname.startsWith("/admin/meets") ||
    pathname.startsWith("/admin/series")
  ) {
    if (pathname.startsWith("/admin/series")) return "/admin/content?tab=series";
    if (pathname.startsWith("/admin/meets")) return "/admin/content?tab=meets";
    if (tab === "series") return `/admin/content?tab=${tab}`;
    return "/admin/content?tab=meets";
  }

  if (
    pathname.startsWith("/admin/catalog") ||
    pathname.startsWith("/admin/speakers") ||
    pathname.startsWith("/admin/competencies")
  ) {
    if (pathname.startsWith("/admin/competencies")) return "/admin/catalog?tab=competencies";
    if (pathname.startsWith("/admin/speakers")) return "/admin/catalog?tab=speakers";
    if (tab === "competencies") return "/admin/catalog?tab=competencies";
    return "/admin/catalog?tab=speakers";
  }

  if (
    pathname.startsWith("/admin/platform") ||
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/approvals")
  ) {
    if (pathname.startsWith("/admin/approvals")) return "/admin/platform?tab=approvals";
    if (tab === "approvals") return "/admin/platform?tab=approvals";
    return "/admin/platform?tab=users";
  }

  return pathname;
}

function AdminSidebarMenu({
  mainItems,
  isAdmin,
}: {
  mainItems: MenuProps["items"];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdminRoute) return;
    setOpenKeys((current) => {
      const next = new Set(current);
      next.add("admin");
      return [...next];
    });
  }, [isAdminRoute, pathname]);

  const adminMenu: MenuProps["items"] = useMemo(
    () => [
      {
        key: "admin",
        icon: <AppstoreOutlined />,
        label: "Admin",
        children: [
          {
            key: "/admin/content?tab=meets",
            icon: <PlaySquareOutlined />,
            label: "Content",
          },
          {
            key: "/admin/catalog?tab=speakers",
            icon: <TagsOutlined />,
            label: "Catalog",
          },
          {
            key: "/admin/platform?tab=users",
            icon: <TeamOutlined />,
            label: "Platform",
          },
        ],
      },
    ],
    [],
  );

  const items = isAdmin ? [...(mainItems ?? []), ...(adminMenu ?? [])] : mainItems;
  const selectedKeys = isAdminRoute
    ? [resolveAdminSelectedKey(pathname, tab)]
    : [pathname];

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      items={items}
      onClick={({ key }) => {
        if (key === "admin") return;
        router.push(key);
      }}
      className="custom-sider-menu kh-admin-menu"
    />
  );
}

export default function AppSidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const mainItems: MenuProps["items"] = [
    { key: "/", icon: <HomeOutlined />, label: "Home" },
    { key: "/explore", icon: <CompassOutlined />, label: "Explore" },
    { key: "/meets", icon: <CalendarOutlined />, label: "Meets" },
    { key: "/series", icon: <PlaySquareOutlined />, label: "Series" },
    { key: "/speakers", icon: <UserOutlined />, label: "Speakers" },
  ];

  return (
    <Sider breakpoint="lg" collapsedWidth={0} className="kh-app-sider">
      <React.Suspense
        fallback={
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={["/"]}
            items={mainItems}
            className="custom-sider-menu"
          />
        }
      >
        <AdminSidebarMenu mainItems={mainItems} isAdmin={isAdmin} />
      </React.Suspense>
      <span className="sidebar_footer">
        <span className="TTN_logo" />
        TO THE NEW © {new Date().getFullYear()}
      </span>
    </Sider>
  );
}

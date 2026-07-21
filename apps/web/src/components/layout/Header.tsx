"use client";

import Link from "next/link";
import React from "react";
import { Avatar, Dropdown, MenuProps, theme } from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { logoutSession } from "@/lib/auth-api";
import NotificationBell from "@/components/layout/NotificationBell";
import HeaderSearch from "@/components/search/HeaderSearch";
import RightPanelToggle from "@/components/layout/RightPanelToggle";

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { token } = theme.useToken();

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutSession();
    } finally {
      logout();
      router.push("/login");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className="header-profile-menu">
          <strong>{user?.name || "User"}</strong>
          <span>{user?.email}</span>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Sign out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header>
      <div className="header-logo">
        <Link className="logo-link" href="/">
          TO THE NEW
        </Link>
        <span className="logo_section_pipe">|</span>
        <span className="logo_section_text">KnowledgeHub</span>
      </div>

      <div className="header-search">
        <HeaderSearch />
      </div>

      <div className="header-actions">
        <RightPanelToggle />
        <NotificationBell />
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <button type="button" className="header-profile" aria-label="Open profile menu">
            <Avatar
              size={36}
              className="user-avatar-header"
              src={user?.avatarUrl || undefined}
              style={{
                backgroundColor: token.colorPrimary,
                color: token.colorWhite,
                border: `2px solid ${token.colorWhite}33`,
                boxShadow: `0 2px 8px ${token.colorPrimary}26`,
              }}
            >
              {initial || <UserOutlined />}
            </Avatar>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

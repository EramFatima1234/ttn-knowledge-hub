"use client";

import { ConfigProvider, App } from "antd";
import React from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#DE1186",
          colorBgBase: "#fafafa",
          colorBgContainer: "#ffffff",
          borderRadius: 10,
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#fafafa",
            siderBg: "#ffffff",
            headerBg: "#ffffff",
          },
          Menu: {
            itemBorderRadius: 0,
            itemColor: "#2E1C41",
            itemSelectedColor: "#DE1186",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}

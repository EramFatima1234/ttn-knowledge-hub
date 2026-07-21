import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ThemeProvider from "@/components/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import GoogleAuthProvider from "@/components/providers/GoogleAuthProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.scss";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "KnowledgeHub | TO THE NEW",
  description: "Internal learning platform for TO THE NEW employees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <ReduxProvider>
          <QueryProvider>
            <GoogleAuthProvider>
              <AntdRegistry>
                <ThemeProvider>
                  <AuthProvider>{children}</AuthProvider>
                </ThemeProvider>
              </AntdRegistry>
            </GoogleAuthProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

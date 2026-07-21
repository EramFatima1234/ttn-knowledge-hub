"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "@/config/env";

export default function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!env.googleClientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

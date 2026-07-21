"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { message, Spin } from "antd";
import {
  PlayCircleOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import loginLogo from "../../../../assets/images/ttn_logo.png";
import { useAuthStore } from "@/store/useAuthStore";
import { loginWithGoogle } from "@/lib/auth-api";
import { env } from "@/config/env";
import "./login.scss";

const FEATURES = [
  {
    icon: <PlayCircleOutlined />,
    title: "Watch & learn",
    description: "Sessions, series, and recordings from across the org.",
  },
  {
    icon: <TeamOutlined />,
    title: "Join knowledge meets",
    description: "Live discussions and community-led learning events.",
  },
  {
    icon: <RocketOutlined />,
    title: "Grow your skills",
    description: "Bookmark content and track your learning journey.",
  },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const googleWrapperRef = useRef<HTMLDivElement>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(searchParams.get("returnUrl") || "/");
    }
  }, [isHydrated, isAuthenticated, router, searchParams]);

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      messageApi.error("Google sign-in failed. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithGoogle(credential);
      setSession({
        ...data.user,
        accessToken: data.accessToken,
      });
      messageApi.success("Welcome to KnowledgeHub");
      router.push(searchParams.get("returnUrl") || "/");
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Sign-in failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    const googleButton = googleWrapperRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement | null;
    googleButton?.click();
  };

  return (
    <div className="kh-login">
      {contextHolder}

      <div className="kh-login__left">
        <div className="kh-login__welcome">
          <p className="kh-login__eyebrow">Internal Learning Platform</p>
          <h1>Welcome to KnowledgeHub</h1>
          <p className="kh-login__tagline">
            Learn, share, and grow with curated knowledge from TO THE NEW.
          </p>

          <ul className="kh-login__features">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <span className="kh-login__feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <span>
                  <strong>{feature.title}</strong>
                  <span>{feature.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="kh-login__glow kh-login__glow--one" aria-hidden="true" />
        <div className="kh-login__glow kh-login__glow--two" aria-hidden="true" />
      </div>

      <div className="kh-login__right">
        <div className="kh-login__top-logo">
          <Image
            src={loginLogo}
            alt="TO THE NEW"
            width={100}
            height={40}
            priority
            className="kh-login__corner-logo"
          />
        </div>

        <div className="kh-login__form-card">
          <div className="kh-login__brand-mark">
            <Image
              src={loginLogo}
              alt="TO THE NEW"
              width={180}
              height={70}
              priority
              className="kh-login__hero-logo"
            />
          </div>

          <div className="kh-login__form-header">
            <h2>Sign in to start</h2>
            <p>
              Use your <strong>@tothenew.com</strong> Google account to
              continue.
            </p>
          </div>

          {env.googleClientId ? (
            <>
              <button
                type="button"
                className="kh-login__google-btn"
                onClick={triggerGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div
                ref={googleWrapperRef}
                className="kh-login__google-hidden"
                aria-hidden="true"
              >
                <GoogleLogin
                  onSuccess={(res) => handleGoogleSuccess(res.credential)}
                  onError={() =>
                    messageApi.error("Google sign-in was cancelled or failed.")
                  }
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width="320"
                />
              </div>

              <p className="kh-login__secure-note">
                Secure sign-in powered by Google Workspace
              </p>
            </>
          ) : (
            <p className="kh-login__error">
              Google Client ID is not configured. Set{" "}
              <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your environment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.522 0-10-4.478-10-10s4.478-10 10-10c2.837 0 5.402 1.062 7.36 2.801l5.657-5.657C33.64 10.053 28.991 8 24 8 12.955 8 4 16.955 4 28s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.837 0 5.402 1.062 7.36 2.801l5.657-5.657C33.64 10.053 28.991 8 24 8 16.318 8 9.656 12.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 39.091 26.715 40 24 40c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 43.556 16.227 48 24 48z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 28c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

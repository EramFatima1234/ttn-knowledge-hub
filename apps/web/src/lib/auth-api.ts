import {
  ApiResponse,
  AuthTokensResponse,
  AuthUser,
  DOMAIN_RESTRICTION_MESSAGE,
} from "@knowledgehub/types";
import { getApiBase } from "@/config/env";

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(", ");
  } catch {
    // ignore
  }
  return "Authentication failed";
}

export async function loginWithGoogle(
  idToken: string,
): Promise<AuthTokensResponse> {
  const response = await fetch(`${getApiBase()}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    if (response.status === 403 && message.includes("TO THE NEW")) {
      throw new Error(DOMAIN_RESTRICTION_MESSAGE);
    }
    throw new Error(message);
  }

  const json = (await response.json()) as ApiResponse<AuthTokensResponse>;
  return json.data;
}

export async function refreshSession(): Promise<AuthTokensResponse> {
  const response = await fetch(`${getApiBase()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Session expired");
  }

  const json = (await response.json()) as ApiResponse<AuthTokensResponse>;
  return json.data;
}

export async function logoutSession(): Promise<void> {
  await fetch(`${getApiBase()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthUser> {
  const response = await fetch(`${getApiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const json = (await response.json()) as ApiResponse<AuthUser>;
  return json.data;
}

import { useAuthStore } from "@/store/useAuthStore";
import { getApiBase } from "@/config/env";
import { refreshSession } from "@/lib/auth-api";
import { getApiErrorMessage as humanizeApiError, humanizeApiErrorMessage } from "@/lib/api-errors";

let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshSession()
      .then((data) => {
        useAuthStore.getState().updateAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        useAuthStore.getState().logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function createApiError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;

  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (body?.message) {
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
  } catch {
    // Response body is not JSON.
  }

  return new ApiError(humanizeApiErrorMessage(message), response.status);
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message;
  return humanizeApiError(error, fallback);
}

export async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const { user } = useAuthStore.getState();
  const headers = new Headers(options.headers || {});
  headers.set("X-Requested-With", "XMLHttpRequest");

  if (user?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${user.accessToken}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;

  const response = await fetch(
    `${getApiBase().replace(/\/$/, "")}/${cleanEndpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
    },
  );

  if (response.status === 401 && retry && user?.accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchApi(endpoint, options, false);
    }
  }

  return response;
}

export async function fetchApiVoid(
  endpoint: string,
  options?: RequestInit,
): Promise<void> {
  const response = await fetchApi(endpoint, options);
  if (!response.ok) {
    throw await createApiError(response);
  }
}

export async function fetchApiJson<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetchApi(endpoint, options);
  if (!response.ok) {
    throw await createApiError(response);
  }
  const json = await response.json();
  return json.data as T;
}

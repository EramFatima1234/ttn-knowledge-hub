export type Environment = "dev" | "qa" | "prod";

const getCurrentEnv = (): Environment => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT as Environment;
  if (env) return env;
  return "dev";
};

const currentEnv = getCurrentEnv();

export const env = {
  name: currentEnv,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  /** Same-origin proxy path — use in browser for cookie-based auth */
  apiProxyPath: "/api",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  isDev: currentEnv === "dev",
  isQA: currentEnv === "qa",
  isProd: currentEnv === "prod",
};

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return env.apiProxyPath;
  }
  return env.apiUrl;
}

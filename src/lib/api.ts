import { supabase } from "./supabase";
import { getDevToken } from "./devAuth";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// DEV ONLY: while real OTP delivery isn't wired up, prefer a locally-minted
// dev token (see AuthContext.devLogin) over the Supabase session.
export async function devLogin(email: string): Promise<{ access_token: string }> {
  const res = await fetch(`${baseUrl}/dev/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dev-login-secret": import.meta.env.VITE_DEV_LOGIN_SECRET ?? "",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Dev login failed");
  return res.json();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const devToken = getDevToken();
  const token = devToken ?? (await supabase.auth.getSession()).data.session?.access_token;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? "Request failed", res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

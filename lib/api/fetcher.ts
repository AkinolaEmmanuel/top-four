import { getCsrfToken, setCsrfToken } from "./csrf";

const DEFAULT_API_URL = "http://localhost:3000/v1";

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export type FetchOptions = RequestInit & {
  skipCsrf?: boolean;
  idempotencyKey?: string;
};

export class ApiError extends Error {
  status: number;
  code: string;
  errors?: { field: string; messages: string[] }[];

  constructor(status: number, code: string, message: string, errors?: any[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Custom fetch wrapper to connect to the TopFour NestJS API.
 * Automatically injects:
 * - credentials: "include" for HttpOnly cookies
 * - x-csrf-token on state-changing requests
 * - Idempotency-Key on resource creation endpoints
 * - Server-side cookie forwarding when run inside Server Components.
 */
export async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  // Set default content type
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Set credentials for session cookie delivery
  const fetchConfig: RequestInit = {
    ...options,
    method,
    headers,
    credentials: "include",
  };

  // Server-side context cookie forwarding
  if (typeof window === "undefined") {
    try {
      // Dynamic import to avoid client-side compilation issues
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (cookieHeader) {
        headers.set("Cookie", cookieHeader);
      }
    } catch (e) {
      // Not in Next.js server context / static generation phase
    }
  }

  // Inject CSRF Token on write requests
  const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isWriteMethod && !options.skipCsrf) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
  }

  // Inject Idempotency-Key on key creation endpoints
  const requiresIdempotency =
    method === "POST" && (path.includes("/auth/register") || path.includes("/leagues"));
  if (requiresIdempotency) {
    const key = options.idempotencyKey || crypto.randomUUID();
    headers.set("Idempotency-Key", key);
  }

  const response = await fetch(url, fetchConfig);

  // Read CSRF Token if returned in response body
  let data: any = null;
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Capture CSRF token if returned in authenticate or get profile payloads
  if (data && typeof data === "object" && data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  if (!response.ok) {
    const status = response.status;
    const code = data?.code || "UNEXPECTED_ERROR";
    const detail = data?.detail || data?.message || "An unexpected error occurred.";
    const errors = data?.errors;
    throw new ApiError(status, code, detail, errors);
  }

  return data as T;
}

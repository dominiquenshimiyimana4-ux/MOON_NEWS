/**
 * Thin API client. When NEXT_PUBLIC_API_URL is set, requests go to the real
 * backend; otherwise the service layer falls back to local sample data so the
 * UI is fully functional before integration.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
export const hasBackend = API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = hasBackend ? `/api/backend${path}` : path;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    try {
      const payload: unknown = await res.json();
      if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
        message = payload.error;
      }
    } catch {
      // Non-JSON errors keep the response status text.
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  if (res.headers.get("content-length") === "0") return undefined as T;
  return (await res.json()) as T;
}
export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Small delay so loading/skeleton states are visible in the demo. */
export function simulateLatency(ms = 250): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
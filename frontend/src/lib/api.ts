const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || JSON.stringify(error));
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get: <T = unknown>(endpoint: string, token?: string | null) =>
    fetchAPI<T>(endpoint, { token }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    token?: string | null
  ) =>
    fetchAPI<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      token,
    }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    token?: string | null
  ) =>
    fetchAPI<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  delete: <T = unknown>(endpoint: string, token?: string | null) =>
    fetchAPI<T>(endpoint, { method: "DELETE", token }),
};

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-rug.svg";
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_MEDIA_URL || "http://127.0.0.1:8000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

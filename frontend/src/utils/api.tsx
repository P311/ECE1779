const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "admin-dev-key";

interface ApiResponse<T = unknown> {
  data: T | null;
  status: number;
  error: string | null;
}

// A common function to make API requests, handling JSON responses and errors uniformly
export async function apiRequest<T = unknown>(
  path: string,
  method: string = "GET",
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = res.ok ? await res.json() : null;
    const error = res.ok ? null : await res.text();

    return { data, status: res.status, error };
  } catch (err) {
    return {
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

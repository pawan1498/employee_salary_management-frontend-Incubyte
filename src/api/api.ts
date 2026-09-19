export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors.join(" ") || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const API_URL = import.meta.env.VITE_API_URL;

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, ["API URL is not configured."]);
  }

  const isFormData = options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...options,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, ["Unable to reach the server."]);
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errors =
      body && typeof body === "object" && Array.isArray((body as { errors?: unknown }).errors)
        ? (body as { errors: string[] }).errors
        : ["Request failed"];
    throw new ApiError(response.status, errors);
  }

  return body as T;
}

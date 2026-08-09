const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3002/api");
/** Default request timeout in milliseconds */
const REQUEST_TIMEOUT = 15_000;

class ApiError extends Error {
  public details?: { field: string; message: string }[];

  constructor(
    public status: number,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add timeout via AbortController for resilience under high traffic
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.error?.message || `API error: ${res.status}`;
      const details = body?.error?.details;
      throw new ApiError(res.status, message, details);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(408, "Request timeout — please try again");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  // For binary responses (e.g. downloading a slide PNG or zip) that need the Bearer token —
  // plain <img src="..."> / <a href="..."> can't attach auth headers, so callers turn this
  // into an object URL via URL.createObjectURL().
  async getBlob(endpoint: string, cacheBust?: string | number): Promise<Blob> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const sep = endpoint.includes("?") ? "&" : "?";
    const url =
      cacheBust !== undefined
        ? `${API_BASE_URL}${endpoint}${sep}v=${encodeURIComponent(String(cacheBust))}`
        : `${API_BASE_URL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT * 4);

    try {
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        let message = `Failed to fetch ${endpoint}: ${res.status}`;
        try {
          const json = JSON.parse(body) as { error?: { message?: string } };
          if (json.error?.message) message = json.error.message;
        } catch {
          /* not JSON */
        }
        throw new ApiError(res.status, message);
      }
      return res.blob();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError(408, "Request timeout — please try again");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "DELETE",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }),

  // Multipart/form-data upload WITH real progress (needs XMLHttpRequest — fetch()
  // has no upload-progress event). Used for PDF admin create/update.
  uploadForm: <T>(
    endpoint: string,
    method: "POST" | "PATCH",
    formData: FormData,
    onProgress?: (percent: number) => void,
  ) => uploadForm<T>(endpoint, method, formData, onProgress),
};

/** Generous — large PDFs on a slow connection can legitimately take a while; the
 *  progress bar (not a timeout) is what tells the admin something is happening. */
const UPLOAD_TIMEOUT = 120_000;

function uploadForm<T>(
  endpoint: string,
  method: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = getToken();

    xhr.open(method, `${API_BASE_URL}${endpoint}`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.timeout = UPLOAD_TIMEOUT;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        /* response wasn't JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve((xhr.status === 204 ? undefined : body) as T);
      } else {
        const errBody = body as {
          error?: { message?: string; details?: unknown };
        } | null;
        const message = errBody?.error?.message || `API error: ${xhr.status}`;
        reject(
          new ApiError(
            xhr.status,
            message,
            errBody?.error?.details as
              | { field: string; message: string }[]
              | undefined,
          ),
        );
      }
    };

    xhr.onerror = () =>
      reject(
        new ApiError(0, "নেটওয়ার্ক সমস্যা — সার্ভারে পৌঁছানো যাচ্ছে না"),
      );
    xhr.ontimeout = () =>
      reject(new ApiError(408, "আপলোড টাইমআউট — আবার চেষ্টা করুন"));
    xhr.onabort = () => reject(new ApiError(0, "আপলোড বাতিল করা হয়েছে"));

    xhr.send(formData);
  });
}

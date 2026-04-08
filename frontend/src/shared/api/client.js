import { API_V1_BASE } from "./envPublic.js";

const API_BASE_URL = API_V1_BASE;

const buildUrl = (path, query = null) => {
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const combined = `${base}${suffix}`;
  const url =
    /^https?:\/\//i.test(API_BASE_URL)
      ? new URL(combined)
      : new URL(combined, globalThis.location?.origin ?? "http://localhost:5173");
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const request = async (path, options = {}) => {
  const { query, body, headers, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

/** Same as request(), but returns null for `nullStatuses` (no throw). Use for session probes. */
export const requestUnless = async (path, nullStatuses, options = {}) => {
  const { query, body, headers, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (nullStatuses.includes(response.status)) {
    return null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const uploadRequest = async (path, formData, options = {}) => {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || "POST",
    credentials: "include",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.message || "Upload failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1";

const buildUrl = (path, query = null) => {
  const url = new URL(`${API_BASE_URL}${path}`);
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

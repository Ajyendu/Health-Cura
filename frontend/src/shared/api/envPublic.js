/**
 * API base path or full URL for /api/v1. With Vite dev proxy, use same-origin "/api/v1".
 */
export const API_V1_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1";

/** Express origin for static paths like /uploads (not under /api/v1). */
export function backendOrigin() {
  if (API_V1_BASE.startsWith("/")) {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  return API_V1_BASE.replace(/\/api\/v1\/?$/i, "");
}

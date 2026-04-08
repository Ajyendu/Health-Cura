import { request, requestUnless, uploadRequest } from "./client";
import { API_V1_BASE } from "./envPublic.js";

export const authApi = {
  registerUser: (payload) =>
    request("/auth/register/user", { method: "POST", body: payload }),
  registerDoctor: (payload) =>
    request("/auth/register/doctor", { method: "POST", body: payload }),
  loginUser: (payload) =>
    request("/auth/login/user", { method: "POST", body: payload }),
  loginDoctor: (payload) =>
    request("/auth/login/doctor", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  /** 401 = not signed in; returns null (not an error). */
  me: () => requestUnless("/auth/me", [401]),
};

export const doctorsApi = {
  list: (query) => request("/doctors", { query }),
  getById: (doctorId) => request(`/doctors/${doctorId}`),
  slots: (doctorId, date) => request(`/doctors/${doctorId}/slots`, { query: { date } }),
  addReview: (doctorId, payload) =>
    request(`/doctors/${doctorId}/reviews`, { method: "POST", body: payload }),
  getMyProfile: () => request("/doctors/me"),
  updateMyProfile: (formData) =>
    uploadRequest("/doctors/me", formData, { method: "PATCH" }),
};

export const appointmentsApi = {
  create: (payload) => request("/appointments", { method: "POST", body: payload }),
  list: (query) => request("/appointments", { query }),
  accept: (id) => request(`/appointments/${id}/accept`, { method: "PATCH" }),
  reject: (id) => request(`/appointments/${id}/reject`, { method: "PATCH" }),
  cancel: (id) => request(`/appointments/${id}/cancel`, { method: "PATCH" }),
  reschedule: (id, startAt) =>
    request(`/appointments/${id}/reschedule`, {
      method: "PATCH",
      body: { startAt },
    }),
  complete: (id) => request(`/appointments/${id}/complete`, { method: "PATCH" }),
  subscribe: (onEvent, onError) => {
    const streamUrl = `${API_V1_BASE.replace(/\/$/, "")}/appointments/stream`;
    const stream = new EventSource(streamUrl, { withCredentials: true });
    stream.addEventListener("appointment-update", (event) => {
      try {
        const payload = JSON.parse(event.data);
        onEvent?.(payload);
      } catch {
        // Ignore malformed JSON from the SSE stream.
      }
    });
    stream.onerror = () => {
      onError?.();
    };
    return () => stream.close();
  },
};

export const profileApi = {
  getProfile: () => request("/users/profile"),
  updateProfile: (payload) =>
    request("/users/profile", { method: "PATCH", body: payload }),
  createPatientProfile: (payload) =>
    request("/users/patient-profiles", { method: "POST", body: payload }),
  updatePatientProfile: (id, payload) =>
    request(`/users/patient-profiles/${id}`, { method: "PATCH", body: payload }),
  deletePatientProfile: (id) =>
    request(`/users/patient-profiles/${id}`, { method: "DELETE" }),
};

export const recordsApi = {
  list: (query) => request("/records", { query }),
  upload: (formData) => uploadRequest("/records/upload", formData),
  delete: (id) => request(`/records/${id}`, { method: "DELETE" }),
  downloadUrl: (id) =>
    `${API_V1_BASE.replace(/\/$/, "")}/records/${id}/download`,
};

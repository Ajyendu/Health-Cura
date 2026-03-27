import React, { useCallback, useEffect, useState } from "react";
import { appointmentsApi } from "@/shared/api/services";
import ConsoleLayout from "@/shared/layout/ConsoleLayout";

const UserAppointmentsPage = () => {
  const [status, setStatus] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [rescheduleMap, setRescheduleMap] = useState({});
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const payload = await appointmentsApi.list({ status, page: 1, limit: 20 });
      setAppointments(payload.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id) => {
    await appointmentsApi.cancel(id);
    load();
  };

  const reschedule = async (id) => {
    const value = rescheduleMap[id];
    if (!value) return;
    await appointmentsApi.reschedule(id, new Date(value).toISOString());
    setRescheduleMap((prev) => ({ ...prev, [id]: "" }));
    load();
  };

  const statuses = ["upcoming", "completed", "cancelled", "rescheduled"];

  return (
    <ConsoleLayout title="My Appointments" subtitle="Manage upcoming visits, history and changes.">
      <div className="hc-tab-row mb-3">
        {statuses.map((key) => (
          <button
            key={key}
            className={`hc-tab-pill ${status === key ? "active" : ""}`}
            onClick={() => setStatus(key)}
          >
            {key}
          </button>
        ))}
      </div>
      {message && <div className="alert alert-warning">{message}</div>}
      <div className="d-grid gap-3">
        {appointments.map((appt) => (
          <div className="hc-panel" key={appt._id}>
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="d-flex gap-3 align-items-center">
                <div className="hc-avatar-chip">
                  {(appt.doctorSnapshot?.name || "D").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="mb-1">{appt.doctorSnapshot?.name}</h5>
                  <p className="mb-0 text-muted">{new Date(appt.startAt).toLocaleString()}</p>
                </div>
              </div>
              <span className="badge rounded-pill text-bg-light border text-capitalize">
                {appt.status}
              </span>
            </div>
            <p className="mb-3 mt-3">{appt.reason}</p>
            {appt.status !== "completed" && appt.status !== "cancelled" && (
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(appt._id)}>
                  Cancel
                </button>
                <input
                  type="datetime-local"
                  className="form-control form-control-sm hc-input-inline"
                  style={{ maxWidth: 240 }}
                  value={rescheduleMap[appt._id] || ""}
                  onChange={(e) =>
                    setRescheduleMap((prev) => ({
                      ...prev,
                      [appt._id]: e.target.value,
                    }))
                  }
                />
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => reschedule(appt._id)}
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>
        ))}
        {!appointments.length && <p className="text-muted">No appointments found.</p>}
      </div>
    </ConsoleLayout>
  );
};

export default UserAppointmentsPage;

import React, { useEffect, useState } from "react";
import { appointmentsApi } from "@/shared/api/services";

const UserAppointmentsPage = () => {
  const [status, setStatus] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [rescheduleMap, setRescheduleMap] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const payload = await appointmentsApi.list({ status, page: 1, limit: 20 });
      setAppointments(payload.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

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

  return (
    <div className="container py-4">
      <h2>My Appointments</h2>
      <div className="btn-group mb-3">
        {["upcoming", "completed", "cancelled", "rescheduled"].map((key) => (
          <button
            key={key}
            className={`btn ${status === key ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setStatus(key)}
          >
            {key}
          </button>
        ))}
      </div>
      {message && <div className="alert alert-warning">{message}</div>}
      <div className="d-grid gap-3">
        {appointments.map((appt) => (
          <div className="card p-3" key={appt._id}>
            <h5>{appt.doctorSnapshot?.name}</h5>
            <p className="mb-1">
              {new Date(appt.startAt).toLocaleString()} - {appt.status}
            </p>
            <p className="mb-2">{appt.reason}</p>
            {appt.status !== "completed" && appt.status !== "cancelled" && (
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(appt._id)}>
                  Cancel
                </button>
                <input
                  type="datetime-local"
                  className="form-control form-control-sm"
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
    </div>
  );
};

export default UserAppointmentsPage;

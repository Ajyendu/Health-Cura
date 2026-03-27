import React, { useEffect, useState } from "react";
import { appointmentsApi } from "@/shared/api/services";
import ConsoleLayout from "@/shared/layout/ConsoleLayout";

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("scheduled");

  const load = async () => {
    try {
      const payload = await appointmentsApi.list({ page: 1, limit: 30 });
      setAppointments(payload.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markComplete = async (id) => {
    await appointmentsApi.complete(id);
    load();
  };

  const cancel = async (id) => {
    await appointmentsApi.cancel(id);
    load();
  };

  const scheduled = appointments.filter((a) => a.status === "upcoming" || a.status === "scheduled");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const visible =
    tab === "scheduled" ? scheduled : tab === "completed" ? completed : cancelled;

  return (
    <ConsoleLayout title="Doctor Dashboard" subtitle="Overview of appointments and patient flow.">
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="hc-panel">
            <div className="text-muted small">Scheduled</div>
            <h3 className="mb-0">{scheduled.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="hc-panel">
            <div className="text-muted small">Completed</div>
            <h3 className="mb-0">{completed.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="hc-panel">
            <div className="text-muted small">Cancelled</div>
            <h3 className="mb-0">{cancelled.length}</h3>
          </div>
        </div>
      </div>
      <div className="hc-tab-row mb-3">
        {["scheduled", "completed", "cancelled"].map((key) => (
          <button
            key={key}
            className={`hc-tab-pill ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {key}
          </button>
        ))}
      </div>
      {message && <div className="alert alert-warning">{message}</div>}
      <div className="d-grid gap-3">
        {visible.map((appt) => (
          <div key={appt._id} className="hc-panel">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="d-flex gap-3 align-items-center">
                <div className="hc-avatar-chip">
                  {(appt.patientSnapshot?.name || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="mb-1">{appt.patientSnapshot?.name}</h5>
                  <p className="mb-0 text-muted">{new Date(appt.startAt).toLocaleString()}</p>
                </div>
              </div>
              <span className="badge rounded-pill text-bg-light border text-capitalize">
                {appt.status}
              </span>
            </div>
            <p className="mb-2 mt-3">{appt.reason}</p>
            {appt.status !== "completed" && appt.status !== "cancelled" && (
              <div className="d-flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => markComplete(appt._id)}>
                  Mark Completed
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(appt._id)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        {!visible.length && <p className="text-muted">No appointments in this section.</p>}
      </div>
    </ConsoleLayout>
  );
};

export default DoctorDashboardPage;

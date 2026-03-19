import React, { useEffect, useState } from "react";
import { appointmentsApi } from "@/shared/api/services";

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

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

  return (
    <div className="container py-4">
      <h2>Doctor Dashboard</h2>
      {message && <div className="alert alert-warning">{message}</div>}
      <div className="d-grid gap-3">
        {appointments.map((appt) => (
          <div key={appt._id} className="card p-3">
            <h5>{appt.patientSnapshot?.name}</h5>
            <p className="mb-1">Status: {appt.status}</p>
            <p className="mb-1">{new Date(appt.startAt).toLocaleString()}</p>
            <p className="mb-2">Reason: {appt.reason}</p>
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
        {!appointments.length && <p className="text-muted">No appointments yet.</p>}
      </div>
    </div>
  );
};

export default DoctorDashboardPage;

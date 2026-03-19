import React, { useEffect, useState } from "react";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("http://localhost:8005/appointment/doctor", {
      credentials: "include", // doctor cookie
    });
    const data = await res.json();
    setAppointments(data);
  };

  const acceptAppointment = async (id) => {
    await fetch(`http://localhost:8005/appointment/${id}/accept`, {
      method: "PUT",
      credentials: "include",
    });
    fetchAppointments(); // refresh UI
  };

  const rejectAppointment = async (id) => {
    await fetch(`http://localhost:8005/appointment/${id}/reject`, {
      method: "PUT",
      credentials: "include",
    });
    fetchAppointments();
  };

  const updateStatus = async (id, action) => {
    await fetch(`http://localhost:8005/appointment/${id}/${action}`, {
      method: "PUT",
      credentials: "include",
    });
    fetchAppointments();
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto" }}>
      <h2 style={{ marginBottom: "20px" }}>🩺 Appointment Requests</h2>

      {appointments.length === 0 && (
        <p style={{ color: "#666" }}>No appointment requests.</p>
      )}

      {appointments.map((appt) => (
        <div
          key={appt._id}
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "18px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: 0 }}>{appt.user.name}</h4>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {appt.user.email}
              </p>
            </div>

            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                background:
                  appt.status === "pending"
                    ? "#FFF3CD"
                    : appt.status === "accepted"
                    ? "#D4EDDA"
                    : "#F8D7DA",
              }}
            >
              {appt.status.toUpperCase()}
            </span>
          </div>

          <hr style={{ margin: "15px 0" }} />

          <p>
            <b>Date:</b> {appt.date}
          </p>
          <p>
            <b>Time:</b> {appt.time}
          </p>

          {appt.status === "pending" && (
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => updateStatus(appt._id, "accept")}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Accept
              </button>

              <button
                onClick={() => updateStatus(appt._id, "reject")}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DoctorAppointments;

import React, { useEffect, useState } from "react";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/appointment/user", {
        credentials: "include",
      });
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusChip = (status) => {
    const styles = {
      pending: { background: "#FFF3CD", color: "#856404" },
      accepted: { background: "#D4EDDA", color: "#155724" },
      rejected: { background: "#F8D7DA", color: "#721C24" },
    };

    return (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600",
          ...styles[status],
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <p style={{ padding: 20 }}>Loading appointments...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h2 style={{ marginBottom: "20px" }}>📅 My Appointments</h2>

      {appointments.length === 0 && (
        <p style={{ color: "#666" }}>No appointments booked yet.</p>
      )}

      {appointments.map((appt) => (
        <div
          key={appt._id}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: 0 }}>Dr. {appt.doctor.name}</h4>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {appt.doctor.category || "General Physician"}
              </p>
            </div>
            {statusChip(appt.status)}
          </div>

          <hr style={{ margin: "15px 0" }} />

          <p>
            <b>Date:</b> {appt.date}
          </p>
          <p>
            <b>Time:</b> {appt.time}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyAppointments;

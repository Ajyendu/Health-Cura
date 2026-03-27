import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { appointmentsApi, doctorsApi, profileApi } from "@/shared/api/services";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import "./doctor-profile.css";

const DoctorProfilePage = () => {
  const { doctorId, id } = useParams();
  const resolvedDoctorId = doctorId || id;
  const { isAuthenticated } = useUserAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("General consultation");
  const [message, setMessage] = useState("");
  const apiOrigin = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1"
  ).replace(/\/api\/v1\/?$/, "");

  useEffect(() => {
    const run = async () => {
      if (!resolvedDoctorId) return;
      const payload = await doctorsApi.getById(resolvedDoctorId);
      setDoctor(payload.data);
    };
    run().catch((err) => setMessage(err.message));
  }, [resolvedDoctorId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileApi
      .getProfile()
      .then((payload) => {
        setProfiles(payload.data?.patientProfiles || []);
        const firstId = payload.data?.patientProfiles?.[0]?._id;
        if (firstId) setSelectedProfile(firstId);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const fetchSlots = async () => {
    if (!date) return;
    try {
      const payload = await doctorsApi.slots(resolvedDoctorId, date);
      setSlots(payload.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const book = async () => {
    if (!selectedSlot || !selectedProfile) {
      setMessage("Select patient profile and slot first.");
      return;
    }
    try {
      await appointmentsApi.create({
        doctorId: resolvedDoctorId,
        patientProfileId: selectedProfile,
        startAt: selectedSlot,
        reason,
      });
      setMessage("Appointment booked successfully.");
      fetchSlots();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!doctor) return <p style={{ padding: "2rem" }}>Loading doctor...</p>;

  return (
    <div className="app-page doctor-profile-shell">
      <div className="doctor-profile-hero p-3 p-md-4 mb-3">
        <div className="d-flex gap-3 align-items-center flex-wrap mb-3">
          <img
            src={
              doctor.photoUrl
                ? `${apiOrigin}${doctor.photoUrl}`
                : "https://via.placeholder.com/140x140?text=Doctor"
            }
            alt={doctor.name}
            className="doctor-profile-avatar"
          />
          <div>
            <h3 className="mb-1">{doctor.name}</h3>
            <p className="mb-1 text-muted">{doctor.specialization}</p>
            <p className="mb-0 text-muted">{doctor.hospital || "Healthcare Specialist"}</p>
          </div>
        </div>

        <div className="doctor-profile-stat-grid">
          <div className="doctor-profile-stat">
            <strong>{doctor.yearsExperience || 0}+ yrs</strong>
            Experience
          </div>
          <div className="doctor-profile-stat">
            <strong>INR {doctor.consultationFee || 0}</strong>
            Session Fee
          </div>
          <div className="doctor-profile-stat">
            <strong>{doctor.ratingAverage?.toFixed(1) || "0.0"}</strong>
            Rating
          </div>
          <div className="doctor-profile-stat">
            <strong>{doctor.ratingCount || 0}</strong>
            Reviews
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-3">
        <h5 className="mb-2">Available Booking Slots</h5>
        <div className="row g-2 align-items-end mb-2">
          <div className="col-md-4">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={fetchSlots}>
              Check Slots
            </button>
          </div>
        </div>

        <div className="doctor-slot-list mb-1">
          {slots.map((slot) => (
            <button
              key={slot.startAt}
              disabled={!slot.isAvailable}
              onClick={() => setSelectedSlot(slot.startAt)}
              className={`btn btn-sm ${
                selectedSlot === slot.startAt ? "btn-primary" : "btn-outline-secondary"
              }`}
            >
              {slot.label} {slot.isAvailable ? "" : "(Booked)"}
            </button>
          ))}
        </div>
      </div>

      {isAuthenticated ? (
        <div className="card border-0 shadow-sm p-3">
          <h5>Book Appointment</h5>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Patient Profile</label>
              <select
                className="form-select"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                <option value="">Select profile</option>
                {profiles.map((profile) => (
                  <option key={profile._id} value={profile._id}>
                    {profile.name} ({profile.relation})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Reason</label>
              <input
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-success w-100" onClick={book}>
                Book
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted">Login as user to book an appointment.</p>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default DoctorProfilePage;

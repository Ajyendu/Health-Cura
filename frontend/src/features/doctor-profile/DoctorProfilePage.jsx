import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { appointmentsApi, doctorsApi, profileApi } from "@/shared/api/services";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";

const DoctorProfilePage = () => {
  const { doctorId } = useParams();
  const { isAuthenticated } = useUserAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("General consultation");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      const payload = await doctorsApi.getById(doctorId);
      setDoctor(payload.data);
    };
    run().catch((err) => setMessage(err.message));
  }, [doctorId]);

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
      const payload = await doctorsApi.slots(doctorId, date);
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
        doctorId,
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
    <div className="container py-4">
      <h2>{doctor.name}</h2>
      <p className="mb-1">Specialization: {doctor.specialization}</p>
      <p className="mb-1">Experience: {doctor.yearsExperience} years</p>
      <p className="mb-1">Consultation Fee: INR {doctor.consultationFee}</p>
      <p className="mb-3">
        Ratings: {doctor.ratingAverage?.toFixed(1) || "0.0"} ({doctor.ratingCount || 0})
      </p>

      <h4>Available Booking Slots</h4>
      <div className="row g-2 align-items-end mb-3">
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

      <div className="d-flex flex-wrap gap-2 mb-3">
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

      {isAuthenticated ? (
        <div className="card p-3">
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

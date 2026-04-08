import React, { useEffect, useMemo, useState } from "react";
import { doctorsApi } from "@/shared/api/services";
import { backendOrigin } from "@/shared/api/envPublic";
import ConsoleLayout from "@/shared/layout/ConsoleLayout";

const DoctorAccountProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const apiOrigin = useMemo(() => backendOrigin(), []);

  const loadProfile = async () => {
    try {
      const payload = await doctorsApi.getMyProfile();
      setProfile(payload.data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const setField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    const formData = new FormData();
    [
      "name",
      "specialization",
      "yearsExperience",
      "consultationFee",
      "bio",
      "qualifications",
      "licenseNumber",
      "contactPhone",
      "clinicAddress",
      "hospital",
      "locationName",
      "slotDurationMinutes",
    ].forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        formData.append(key, String(profile[key]));
      }
    });

    formData.append("languages", (profile.languages || []).join(", "));
    formData.append("lat", String(profile.location?.coordinates?.[1] ?? ""));
    formData.append("lng", String(profile.location?.coordinates?.[0] ?? ""));
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const payload = await doctorsApi.updateMyProfile(formData);
      setProfile(payload.data);
      setPhoto(null);
      setMessage("Doctor profile updated successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!profile) {
    return <p style={{ padding: "2rem" }}>Loading doctor profile...</p>;
  }

  return (
    <ConsoleLayout title="Doctor Profile Management" subtitle="Update profile, credentials and availability settings.">
      {message && <div className="alert alert-info">{message}</div>}

      <form className="hc-panel" onSubmit={handleSubmit}>
        <h5 className="mb-3">Profile & Basic Details</h5>
        <div className="row g-3">
          <div className="col-md-2">
            <img
              src={
                profile.photoUrl
                  ? `${apiOrigin}${profile.photoUrl}`
                  : "https://via.placeholder.com/140x140?text=Doctor"
              }
              alt="Doctor profile"
              style={{ width: 140, height: 140, borderRadius: 12, objectFit: "cover" }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Profile photo</label>
            <input
              type="file"
              className="form-control"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control"
              rows={4}
              value={profile.bio || ""}
              onChange={(e) => setField("bio", e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Full name</label>
            <input
              className="form-control"
              value={profile.name || ""}
              onChange={(e) => setField("name", e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Specialization</label>
            <input
              className="form-control"
              value={profile.specialization || ""}
              onChange={(e) => setField("specialization", e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Experience (yrs)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={profile.yearsExperience ?? 0}
              onChange={(e) => setField("yearsExperience", e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Fee (INR)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={profile.consultationFee ?? 0}
              onChange={(e) => setField("consultationFee", e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Qualifications</label>
            <input
              className="form-control"
              value={profile.qualifications || ""}
              onChange={(e) => setField("qualifications", e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">License number</label>
            <input
              className="form-control"
              value={profile.licenseNumber || ""}
              onChange={(e) => setField("licenseNumber", e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Languages (comma separated)</label>
            <input
              className="form-control"
              value={(profile.languages || []).join(", ")}
              onChange={(e) =>
                setField(
                  "languages",
                  e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Hospital</label>
            <input
              className="form-control"
              value={profile.hospital || ""}
              onChange={(e) => setField("hospital", e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Clinic area / city</label>
            <input
              className="form-control"
              value={profile.locationName || ""}
              onChange={(e) => setField("locationName", e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Clinic address</label>
            <input
              className="form-control"
              value={profile.clinicAddress || ""}
              onChange={(e) => setField("clinicAddress", e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Contact phone</label>
            <input
              className="form-control"
              value={profile.contactPhone || ""}
              onChange={(e) => setField("contactPhone", e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Slot duration (mins)</label>
            <input
              type="number"
              min={5}
              max={120}
              className="form-control"
              value={profile.slotDurationMinutes ?? 30}
              onChange={(e) => setField("slotDurationMinutes", e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={profile.location?.coordinates?.[1] ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  location: {
                    ...(prev.location || { type: "Point", coordinates: [0, 0] }),
                    coordinates: [
                      prev.location?.coordinates?.[0] ?? 0,
                      Number(e.target.value),
                    ],
                  },
                }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={profile.location?.coordinates?.[0] ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  location: {
                    ...(prev.location || { type: "Point", coordinates: [0, 0] }),
                    coordinates: [
                      Number(e.target.value),
                      prev.location?.coordinates?.[1] ?? 0,
                    ],
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary px-4">
            Save Doctor Profile
          </button>
        </div>
      </form>
    </ConsoleLayout>
  );
};

export default DoctorAccountProfilePage;

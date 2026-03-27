import React, { useEffect, useState } from "react";
import { profileApi } from "@/shared/api/services";
import ConsoleLayout from "@/shared/layout/ConsoleLayout";

const emptyPatient = { name: "", age: "", gender: "other", relation: "", contact: "" };

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [patientDraft, setPatientDraft] = useState(emptyPatient);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("personal");

  const load = async () => {
    try {
      const payload = await profileApi.getProfile();
      setProfile(payload.data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async () => {
    const payload = await profileApi.updateProfile({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      contact: profile.contact,
    });
    setProfile(payload.data);
    setMessage("Profile updated.");
  };

  const addPatient = async () => {
    await profileApi.createPatientProfile({
      ...patientDraft,
      age: Number(patientDraft.age),
    });
    setPatientDraft(emptyPatient);
    load();
  };

  const removePatient = async (id) => {
    await profileApi.deletePatientProfile(id);
    load();
  };

  if (!profile) return <p style={{ padding: "2rem" }}>Loading profile...</p>;

  return (
    <ConsoleLayout title="My Profile" subtitle="Manage personal and family information.">
      <div className="hc-tab-row mb-3">
        <button className={`hc-tab-pill ${tab === "personal" ? "active" : ""}`} onClick={() => setTab("personal")}>
          Personal Info
        </button>
        <button className={`hc-tab-pill ${tab === "family" ? "active" : ""}`} onClick={() => setTab("family")}>
          Family Profiles
        </button>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      {tab === "personal" && <div className="hc-panel mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              value={profile.name || ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              value={profile.age || ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))}
              placeholder="Age"
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={profile.gender || "other"}
              onChange={(e) => setProfile((prev) => ({ ...prev, gender: e.target.value }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              value={profile.contact || ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, contact: e.target.value }))}
              placeholder="Contact"
            />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" onClick={saveProfile}>
            Save Profile
          </button>
        </div>
      </div>}

      {tab === "family" && <div className="hc-panel mb-3">
        <h5>Add Family Member</h5>
        <div className="row g-2">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Name"
              value={patientDraft.name}
              onChange={(e) => setPatientDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Age"
              value={patientDraft.age}
              onChange={(e) => setPatientDraft((p) => ({ ...p, age: e.target.value }))}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={patientDraft.gender}
              onChange={(e) => setPatientDraft((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Relation"
              value={patientDraft.relation}
              onChange={(e) => setPatientDraft((p) => ({ ...p, relation: e.target.value }))}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Contact"
              value={patientDraft.contact}
              onChange={(e) => setPatientDraft((p) => ({ ...p, contact: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-outline-primary" onClick={addPatient}>
            Add Profile
          </button>
        </div>
      </div>}

      {tab === "family" && <div className="hc-panel">
        <h5>Patient Profiles</h5>
        <div className="d-grid gap-2">
          {profile.patientProfiles?.map((member) => (
            <div className="border rounded p-2 d-flex justify-content-between" key={member._id}>
              <span>
                {member.name} ({member.relation}) - {member.age} / {member.gender}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removePatient(member._id)}
              >
                Delete
              </button>
            </div>
          ))}
          {!profile.patientProfiles?.length && (
            <p className="text-muted">No patient profiles added yet.</p>
          )}
        </div>
      </div>}
    </ConsoleLayout>
  );
};

export default ProfilePage;

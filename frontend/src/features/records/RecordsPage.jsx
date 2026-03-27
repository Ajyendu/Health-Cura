import React, { useCallback, useEffect, useState } from "react";
import { profileApi, recordsApi } from "@/shared/api/services";
import ConsoleLayout from "@/shared/layout/ConsoleLayout";

const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [patientProfileId, setPatientProfileId] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const profilePayload = await profileApi.getProfile();
    const members = profilePayload.data?.patientProfiles || [];
    setProfiles(members);
    const selected = patientProfileId || members[0]?._id || "";
    if (selected) setPatientProfileId(selected);
    const recordsPayload = await recordsApi.list(
      selected ? { patientProfileId: selected, page: 1, limit: 20 } : { page: 1, limit: 20 }
    );
    setRecords(recordsPayload.data || []);
  }, [patientProfileId]);

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, [load]);

  useEffect(() => {
    if (!patientProfileId) return;
    recordsApi
      .list({ patientProfileId, page: 1, limit: 20 })
      .then((payload) => setRecords(payload.data || []))
      .catch((err) => setMessage(err.message));
  }, [patientProfileId]);

  const upload = async () => {
    if (!file || !patientProfileId) {
      setMessage("Select a patient profile and file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientProfileId", patientProfileId);
    formData.append("notes", notes);
    await recordsApi.upload(formData);
    setFile(null);
    setNotes("");
    setMessage("Record uploaded.");
    load();
  };

  const remove = async (id) => {
    await recordsApi.delete(id);
    load();
  };

  return (
    <ConsoleLayout title="Medical Records" subtitle="Upload, organize and view documents.">
      {message && <div className="alert alert-info">{message}</div>}

      <div className="hc-panel mb-3">
        <h5 className="mb-3">Upload report (PDF/image)</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <select
              className="form-select"
              value={patientProfileId}
              onChange={(e) => setPatientProfileId(e.target.value)}
            >
              <option value="">Select patient</option>
              {profiles.map((profile) => (
                <option key={profile._id} value={profile._id}>
                  {profile.name} ({profile.relation})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary px-4" onClick={upload}>
            Upload
          </button>
        </div>
      </div>

      <div className="hc-panel">
        <h5 className="mb-3">Past reports</h5>
        <div className="d-grid gap-2">
          {records.map((record) => (
            <div className="border rounded-4 p-3 d-flex justify-content-between align-items-center" key={record._id}>
              <div>
                <div className="fw-medium">{record.originalName}</div>
                <small className="text-muted">{new Date(record.createdAt).toLocaleString()}</small>
              </div>
              <div className="d-flex gap-2">
                <a
                  className="btn btn-sm btn-outline-primary"
                  href={recordsApi.downloadUrl(record._id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(record._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!records.length && <p className="text-muted">No records found.</p>}
        </div>
      </div>
    </ConsoleLayout>
  );
};

export default RecordsPage;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doctorsApi } from "@/shared/api/services";

const DoctorSearchPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    date: "",
    lat: "",
    lng: "",
    radiusKm: 10,
    page: 1,
  });
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await doctorsApi.list(filters);
      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [filters.page]);

  const setField = (name, value) => {
    setFilters((prev) => ({ ...prev, page: 1, [name]: value }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          page: 1,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
      },
      () => setError("Unable to fetch your location.")
    );
  };

  return (
    <div className="container py-4">
      <h2>Discover Doctors</h2>
      <p className="text-muted">
        Filter by specialization, location, and available date.
      </p>

      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search name/location"
            value={filters.search}
            onChange={(e) => setField("search", e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Specialization"
            value={filters.specialization}
            onChange={(e) => setField("specialization", e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={filters.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Radius Km"
            value={filters.radiusKm}
            onChange={(e) => setField("radiusKm", e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button className="btn btn-outline-primary w-100" onClick={useMyLocation}>
            Use My Location
          </button>
          <button className="btn btn-primary w-100" onClick={loadDoctors}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      {loading && <p>Loading doctors...</p>}

      <div className="row g-3">
        {result.data?.map((doctor) => {
          const lat = doctor.location?.coordinates?.[1];
          const lng = doctor.location?.coordinates?.[0];
          const mapUrl =
            lat && lng ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}` : null;
          return (
            <div className="col-md-6 col-lg-4" key={doctor._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{doctor.name}</h5>
                  <p className="mb-1">{doctor.specialization}</p>
                  <p className="mb-1 text-muted">{doctor.locationName || "Clinic location"}</p>
                  <p className="mb-1">
                    Fee: INR {doctor.consultationFee} | Experience:{" "}
                    {doctor.yearsExperience} yrs
                  </p>
                  <p className="mb-3">
                    Rating: {doctor.ratingAverage?.toFixed(1) || "0.0"} (
                    {doctor.ratingCount || 0})
                  </p>
                  <div className="d-flex gap-2">
                    <Link className="btn btn-primary btn-sm" to={`/doctors/${doctor._id}`}>
                      View Profile
                    </Link>
                    {mapUrl && (
                      <a
                        className="btn btn-outline-secondary btn-sm"
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {result.pagination && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>
            Page {result.pagination.page} / {Math.max(result.pagination.totalPages, 1)}
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={result.pagination.page <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
              }
            >
              Prev
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={result.pagination.page >= result.pagination.totalPages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(prev.page + 1, result.pagination.totalPages),
                }))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearchPage;

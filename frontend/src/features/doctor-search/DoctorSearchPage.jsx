import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { doctorsApi } from "@/shared/api/services";
import { backendOrigin } from "@/shared/api/envPublic";
import "./doctor-search.css";

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SPECIALIZATION_OPTIONS = [
  "",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
];

const MapAutoFit = ({ doctors, userLatLng }) => {
  const map = useMap();

  useEffect(() => {
    const points = doctors
      .map((doctor) => {
        const lat = doctor.location?.coordinates?.[1];
        const lng = doctor.location?.coordinates?.[0];
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
      })
      .filter(Boolean);

    if (userLatLng) {
      points.push([userLatLng.lat, userLatLng.lng]);
    }

    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [doctors, map, userLatLng]);

  return null;
};

const MapViewController = ({ mapFocus }) => {
  const map = useMap();

  useEffect(() => {
    if (!mapFocus) return;
    map.setView([mapFocus.lat, mapFocus.lng], mapFocus.zoom, { animate: true });
  }, [map, mapFocus]);

  return null;
};

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
  const [appliedFilters, setAppliedFilters] = useState({
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
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [mapFocus, setMapFocus] = useState(null);
  const [localViewLocked, setLocalViewLocked] = useState(false);
  const [searchInfo, setSearchInfo] = useState("");

  const userLatLng = useMemo(
    () =>
      filters.lat && filters.lng
        ? { lat: Number(filters.lat), lng: Number(filters.lng) }
        : null,
    [filters.lat, filters.lng]
  );

  const doctorsWithCoords = useMemo(
    () =>
      (result.data || []).filter((doctor) => {
        const lat = doctor.location?.coordinates?.[1];
        const lng = doctor.location?.coordinates?.[0];
        return Number.isFinite(lat) && Number.isFinite(lng);
      }),
    [result.data]
  );

  const mapCenter = useMemo(() => {
    if (userLatLng) return [userLatLng.lat, userLatLng.lng];
    if (doctorsWithCoords.length) {
      return [
        doctorsWithCoords[0].location.coordinates[1],
        doctorsWithCoords[0].location.coordinates[0],
      ];
    }
    return [20.5937, 78.9629];
  }, [doctorsWithCoords, userLatLng]);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    setSearchInfo("");
    try {
      let payload = await doctorsApi.list(appliedFilters);
      let usedRadius = Number(appliedFilters.radiusKm || 10);

      const canAutoExpand =
        !!appliedFilters.lat &&
        !!appliedFilters.lng &&
        !appliedFilters.search &&
        !appliedFilters.specialization &&
        !appliedFilters.date;

      if (canAutoExpand && (!payload.data || payload.data.length === 0)) {
        const expansionSteps = [20, 40, 60, 80, 100];
        for (const step of expansionSteps) {
          if (step <= usedRadius) continue;
          const expanded = await doctorsApi.list({
            ...appliedFilters,
            radiusKm: step,
            page: 1,
          });
          if (expanded.data && expanded.data.length > 0) {
            payload = expanded;
            usedRadius = step;
            setFilters((prev) => ({ ...prev, radiusKm: step, page: 1 }));
            setAppliedFilters((prev) => ({ ...prev, radiusKm: step, page: 1 }));
            setSearchInfo(`No doctors in 10 km. Expanded search radius to ${step} km.`);
            break;
          }
        }
      }

      if ((payload.data || []).length === 0 && canAutoExpand) {
        setSearchInfo("No nearby doctors found in current area.");
      }

      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const setField = (name, value) => {
    setLocalViewLocked(false);
    setFilters((prev) => ({ ...prev, page: 1, [name]: value }));
  };

  const setCurrentLocation = useCallback((applySearch = true) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLocalViewLocked(true);
        setMapFocus({ lat, lng, zoom: 14 });
        setFilters((prev) => ({
          ...prev,
          page: 1,
          lat,
          lng,
        }));
        if (applySearch) {
          setAppliedFilters((prev) => ({
            ...prev,
            page: 1,
            lat,
            lng,
          }));
        }
      },
      () => setError("Unable to fetch your location.")
    );
  }, []);

  useEffect(() => {
    // By default show nearby doctors around current location.
    setCurrentLocation(true);
  }, [setCurrentLocation]);

  const resetToLocalNearby = useCallback(() => {
    setSearchInfo("");
    setSelectedDoctorId("");
    setLocalViewLocked(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          setMapFocus({ lat, lng, zoom: 14 });
          setFilters((prev) => ({
            ...prev,
            search: "",
            specialization: "",
            date: "",
            lat,
            lng,
            radiusKm: 10,
            page: 1,
          }));
          setAppliedFilters((prev) => ({
            ...prev,
            search: "",
            specialization: "",
            date: "",
            lat,
            lng,
            radiusKm: 10,
            page: 1,
          }));
        },
        () => {
          setFilters((prev) => ({
            ...prev,
            search: "",
            specialization: "",
            date: "",
            radiusKm: 10,
            page: 1,
          }));
          setAppliedFilters((prev) => ({
            ...prev,
            search: "",
            specialization: "",
            date: "",
            radiusKm: 10,
            page: 1,
          }));
          setError("Unable to reset to current location.");
        }
      );
      return;
    }

    setFilters((prev) => ({
      ...prev,
      search: "",
      specialization: "",
      date: "",
      radiusKm: 10,
      page: 1,
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      search: "",
      specialization: "",
      date: "",
      radiusKm: 10,
      page: 1,
    }));
  }, []);

  const runSearch = useCallback(() => {
    setSelectedDoctorId("");
    setLocalViewLocked(false);
    setFilters((prev) => ({ ...prev, page: 1 }));
    setAppliedFilters((prev) => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, [filters]);

  const specializationChips = useMemo(
    () => SPECIALIZATION_OPTIONS.filter(Boolean),
    []
  );

  const featuredDoctor = result.data?.[0] || null;

  return (
    <div className="app-page doctor-search-page">
      <div className="doctor-search-hero p-3 p-md-4 mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="mb-1">Hello 👋 Find Your Doctor</h4>
            <p className="text-muted mb-0">
              Search, filter, map view, and quick booking in one place.
            </p>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={resetToLocalNearby}>
            Reset to Local Nearby
          </button>
        </div>

        <div className="row g-2 mt-2">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search name or location"
              value={filters.search}
              onChange={(e) => setField("search", e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.specialization}
              onChange={(e) => setField("specialization", e.target.value)}
            >
              {SPECIALIZATION_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "All Specializations"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={filters.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-primary w-100" onClick={runSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="row g-2 mt-1 align-items-center">
          <div className="col-md-4">
            <label className="form-label mb-1 small">Range: {filters.radiusKm} km</label>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              className="form-range"
              value={filters.radiusKm}
              onChange={(e) => setField("radiusKm", Number(e.target.value))}
            />
          </div>
          <div className="col-md-8">
            <div className="doctor-search-chip-wrap">
              {specializationChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  className={`doctor-search-chip ${
                    filters.specialization === chip ? "active" : ""
                  }`}
                  onClick={() => setField("specialization", chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {featuredDoctor && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="small text-muted">Top Match</div>
              <h5 className="mb-1">{featuredDoctor.name}</h5>
              <div className="doctor-meta">
                {featuredDoctor.specialization} · INR {featuredDoctor.consultationFee} / session
              </div>
            </div>
            <Link className="btn btn-primary" to={`/doctors/${featuredDoctor._id}`}>
              View Profile
            </Link>
          </div>
        </div>
      )}

      {error && <div className="alert alert-warning">{error}</div>}
      {searchInfo && <div className="alert alert-info">{searchInfo}</div>}
      {loading && <p>Loading doctors...</p>}

      <div className="doctor-search-map-wrap mb-3">
        <button
          type="button"
          className="btn btn-light btn-sm shadow doctor-search-map-btn"
          onClick={() => setCurrentLocation(true)}
          title="Go to current location"
        >
          📍
        </button>
        <div style={{ height: "320px" }}>
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {localViewLocked && userLatLng ? (
              <MapViewController mapFocus={mapFocus || { ...userLatLng, zoom: 14 }} />
            ) : (
              <MapAutoFit doctors={doctorsWithCoords} userLatLng={userLatLng} />
            )}

            {userLatLng && (
              <>
                <Marker position={[userLatLng.lat, userLatLng.lng]} icon={defaultIcon}>
                  <Popup>Your selected location</Popup>
                </Marker>
                <Circle
                  center={[userLatLng.lat, userLatLng.lng]}
                  radius={Number(filters.radiusKm || 10) * 1000}
                  pathOptions={{ color: "#2563eb", fillOpacity: 0.08 }}
                />
              </>
            )}

            <MarkerClusterGroup chunkedLoading>
              {doctorsWithCoords.map((doctor) => {
                const lat = doctor.location.coordinates[1];
                const lng = doctor.location.coordinates[0];
                const isSelected = selectedDoctorId === doctor._id;
                return (
                  <Marker
                    key={doctor._id}
                    position={[lat, lng]}
                    icon={isSelected ? selectedIcon : defaultIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedDoctorId(doctor._id);
                        setLocalViewLocked(false);
                      },
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: "180px" }}>
                        <strong>{doctor.name}</strong>
                        <div>{doctor.specialization}</div>
                        <div>Fee: INR {doctor.consultationFee}</div>
                        <div className="mt-2">
                          <Link to={`/doctors/${doctor._id}`}>View Profile</Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>

      <div className="row g-3">
        {result.data?.map((doctor) => {
          const lat = doctor.location?.coordinates?.[1];
          const lng = doctor.location?.coordinates?.[0];
          const mapUrl =
            lat && lng ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}` : null;
          const imageUrl = doctor.photoUrl
            ? `${backendOrigin()}${doctor.photoUrl}`
            : "https://via.placeholder.com/80x80?text=Dr";

          return (
            <div className="col-md-6 col-lg-4" key={doctor._id}>
              <div
                className={`doctor-card-modern p-3 ${
                  selectedDoctorId === doctor._id ? "selected" : ""
                }`}
                onMouseEnter={() => setSelectedDoctorId(doctor._id)}
              >
                <div className="d-flex gap-2 align-items-start mb-2">
                  <img src={imageUrl} alt={doctor.name} className="doctor-avatar" />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{doctor.name}</h6>
                    <div className="doctor-meta">{doctor.specialization}</div>
                    <div className="doctor-meta">{doctor.locationName || "Clinic location"}</div>
                  </div>
                </div>

                <div className="doctor-stats-mini mb-2">
                  <div className="item">
                    <span className="value">{doctor.yearsExperience || 0}y</span>
                    Experience
                  </div>
                  <div className="item">
                    <span className="value">INR {doctor.consultationFee}</span>
                    Session
                  </div>
                  <div className="item">
                    <span className="value">
                      {doctor.ratingAverage?.toFixed(1) || "0.0"}⭐
                    </span>
                    Rating
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Link className="btn btn-primary btn-sm flex-grow-1" to={`/doctors/${doctor._id}`}>
                    View Profile
                  </Link>
                  {mapUrl && (
                    <a
                      className="btn btn-outline-secondary btn-sm"
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Map
                    </a>
                  )}
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
              onClick={() => {
                const nextPage = Math.max(appliedFilters.page - 1, 1);
                setFilters((prev) => ({ ...prev, page: nextPage }));
                setAppliedFilters((prev) => ({ ...prev, page: nextPage }));
              }}
            >
              Prev
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={result.pagination.page >= result.pagination.totalPages}
              onClick={() => {
                const nextPage = Math.min(
                  appliedFilters.page + 1,
                  result.pagination.totalPages
                );
                setFilters((prev) => ({ ...prev, page: nextPage }));
                setAppliedFilters((prev) => ({ ...prev, page: nextPage }));
              }}
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

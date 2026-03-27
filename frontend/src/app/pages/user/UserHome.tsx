import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { UserNav } from "../../components/UserNav";
import { DoctorCard } from "../../components/DoctorCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Search, MapPin, RotateCcw, Map, Grid3x3, Calendar as CalendarIcon } from "lucide-react";
import { doctorsApi } from "@/shared/api/services";
import { withDrPrefix } from "@/shared/utils/doctorName";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UI_STATE_KEY = "healthcura:user-home-state";

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const formatMinutes = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function UserHome() {
  const navigate = useNavigate();
  const mapRef = useRef<LeafletMap | null>(null);
  const [skipInitialGeoSync, setSkipInitialGeoSync] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availabilityMode, setAvailabilityMode] = useState<"all" | "available">("all");
  const [rangeKm, setRangeKm] = useState([25]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    specialization: "All Specializations",
    date: "",
    availableOnly: false,
    range: 25,
    lat: "",
    lng: "",
  });
  const currentLocationIcon = useMemo(
    () =>
      L.divIcon({
        className: "current-location-marker",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.2);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    []
  );

  const specializations = [
    "All Specializations",
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

  const fitMapToRange = useCallback((lat: number, lng: number, range: number) => {
    if (!mapRef.current) return;
    const radiusMeters = Math.max(1, Number(range || 1)) * 1000;
    const bounds = L.circle([lat, lng], { radius: radiusMeters }).getBounds();
    mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, []);

  const handleSearch = () => {
    const effectiveDate =
      selectedDate || availabilityMode === "available" ? selectedDate || new Date() : undefined;
    const nextFilters = {
      search: searchTerm,
      specialization: selectedSpecialization,
      date: effectiveDate ? format(effectiveDate, "yyyy-MM-dd") : "",
      availableOnly: availabilityMode === "available",
      range: rangeKm[0],
      lat: String(userLocation.lat),
      lng: String(userLocation.lng),
    };
    setSearchFilters(nextFilters);
    if (viewMode === "map") {
      fitMapToRange(userLocation.lat, userLocation.lng, nextFilters.range);
    }
  };

  const persistUiState = useCallback(() => {
    sessionStorage.setItem(
      UI_STATE_KEY,
      JSON.stringify({
        searchTerm,
        selectedSpecialization,
        selectedDate: selectedDate ? selectedDate.toISOString() : "",
        availabilityMode,
        rangeKm: rangeKm[0],
        viewMode,
        userLocation,
        searchFilters,
      })
    );
  }, [
    rangeKm,
    searchFilters,
    searchTerm,
    selectedDate,
    selectedSpecialization,
    availabilityMode,
    userLocation,
    viewMode,
  ]);

  const openNavigation = (
    doctor: { lat: number; lng: number },
    mode: "walk" | "bike" | "car"
  ) => {
    const travelMode =
      mode === "walk" ? "walking" : mode === "bike" ? "bicycling" : "driving";
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${doctor.lat},${doctor.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setUserLocation({ lat, lng });
        mapRef.current?.flyTo([lat, lng], 13, { animate: true, duration: 1 });
      },
      () => toast.error("Unable to access your current location")
    );
  };

  useEffect(() => {
    const raw = sessionStorage.getItem(UI_STATE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.searchTerm === "string") setSearchTerm(parsed.searchTerm);
      if (typeof parsed.selectedSpecialization === "string") {
        setSelectedSpecialization(parsed.selectedSpecialization);
      }
      if (typeof parsed.selectedDate === "string" && parsed.selectedDate) {
        setSelectedDate(new Date(parsed.selectedDate));
      }
      if (parsed.availabilityMode === "all" || parsed.availabilityMode === "available") {
        setAvailabilityMode(parsed.availabilityMode);
      }
      if (Number.isFinite(Number(parsed.rangeKm))) {
        setRangeKm([Number(parsed.rangeKm)]);
      }
      if (parsed.viewMode === "grid" || parsed.viewMode === "map") {
        setViewMode(parsed.viewMode);
      }
      if (
        parsed.userLocation &&
        Number.isFinite(Number(parsed.userLocation.lat)) &&
        Number.isFinite(Number(parsed.userLocation.lng))
      ) {
        setUserLocation({
          lat: Number(parsed.userLocation.lat),
          lng: Number(parsed.userLocation.lng),
        });
      }
      if (
        parsed.searchFilters &&
        typeof parsed.searchFilters === "object" &&
        parsed.searchFilters.lat &&
        parsed.searchFilters.lng
      ) {
        setSearchFilters({
          search: String(parsed.searchFilters.search || ""),
          specialization: String(
            parsed.searchFilters.specialization || "All Specializations"
          ),
          date: String(parsed.searchFilters.date || ""),
          availableOnly: Boolean(parsed.searchFilters.availableOnly),
          range: Number(parsed.searchFilters.range || 25),
          lat: String(parsed.searchFilters.lat),
          lng: String(parsed.searchFilters.lng),
        });
        setSkipInitialGeoSync(true);
      }
    } catch {}
  }, []);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSpecialization("All Specializations");
    setSelectedDate(undefined);
    setAvailabilityMode("all");
    setRangeKm([25]);
    setSearchFilters({
      search: "",
      specialization: "All Specializations",
      date: "",
      availableOnly: false,
      range: 25,
      lat: String(userLocation.lat),
      lng: String(userLocation.lng),
    });
  };

  const loadDoctors = useCallback(async () => {
    try {
      const payload = await doctorsApi.list({
        search: searchFilters.search,
        specialization:
          searchFilters.specialization === "All Specializations"
            ? ""
            : searchFilters.specialization,
        date: searchFilters.date,
        availableOnly: searchFilters.availableOnly,
        radiusKm: searchFilters.range,
        lat: searchFilters.lat,
        lng: searchFilters.lng,
        page: 1,
      });
      setDoctors(payload?.data || []);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load doctors");
    }
  }, [searchFilters]);

  useEffect(() => {
    if (skipInitialGeoSync) return;
    if (!navigator.geolocation) {
      setSearchFilters((prev) => ({
        ...prev,
        lat: String(userLocation.lat),
        lng: String(userLocation.lng),
      }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setUserLocation({ lat, lng });
        setSearchFilters((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
      },
      () => {
        setSearchFilters((prev) => ({
          ...prev,
          lat: String(userLocation.lat),
          lng: String(userLocation.lng),
        }));
      }
    );
  }, [skipInitialGeoSync]);

  useEffect(() => {
    if (!searchFilters.lat || !searchFilters.lng) return;
    loadDoctors();
  }, [loadDoctors, searchFilters.lat, searchFilters.lng]);

  useEffect(() => {
    persistUiState();
  }, [persistUiState]);

  useEffect(() => {
    if (viewMode !== "map") return;
    const timer = setTimeout(() => {
      fitMapToRange(userLocation.lat, userLocation.lng, searchFilters.range);
    }, 0);
    return () => clearTimeout(timer);
  }, [fitMapToRange, searchFilters.range, userLocation.lat, userLocation.lng, viewMode]);

  const filteredDoctors = useMemo(() => doctors, [doctors]);

  const mappedDoctors = useMemo(
    () =>
      filteredDoctors.map((doctor) => ({
        id: doctor._id,
        name: withDrPrefix(doctor.name),
        specialization: doctor.specialization,
        image: doctor.photoUrl
          ? `${
              (import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1").replace(
                /\/api\/v1\/?$/,
                ""
              )
            }${doctor.photoUrl}`
          : "https://via.placeholder.com/200x200?text=Doctor",
        location: doctor.locationName || "Location not set by doctor yet",
        fee: doctor.consultationFee ?? null,
        experience: doctor.verified ? doctor.yearsExperience ?? null : null,
        rating: doctor.ratingCount ? doctor.ratingAverage || 0 : null,
        reviews: doctor.ratingCount || 0,
        lat: doctor.location?.coordinates?.[1],
        lng: doctor.location?.coordinates?.[0],
      })),
    [filteredDoctors]
  );

  const quickSpecializations = ["Cardiology", "Dermatology", "Pediatrics", "Orthopedics"];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Doctor</h1>
          <p className="text-gray-600">
            Search and book appointments with trusted healthcare professionals
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-20 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-teal-600 hover:text-teal-700"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-11 rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={availabilityMode}
                  onValueChange={(value: "all" | "available") => setAvailabilityMode(value)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    <SelectItem value="available">Available on selected date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Range Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Range</Label>
                  <span className="text-sm font-medium text-teal-600">{rangeKm[0]} km</span>
                </div>
                <Slider
                  value={rangeKm}
                  onValueChange={setRangeKm}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>

              {/* Quick Specializations */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {quickSpecializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant={selectedSpecialization === spec ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedSpecialization === spec
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "hover:bg-teal-50"
                      }`}
                      onClick={() => setSelectedSpecialization(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reset to Local Nearby */}
              <Button
                variant="outline"
                className="w-full rounded-xl border-teal-600 text-teal-600 hover:bg-teal-50"
                onClick={handleReset}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Reset to Local Nearby
              </Button>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {/* Search Bar & View Toggle */}
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search doctors by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    className={viewMode === "grid" ? "bg-teal-600" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="icon"
                    className={viewMode === "map" ? "bg-teal-600" : ""}
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-4">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{filteredDoctors.length}</span>{" "}
                doctors
              </p>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="space-y-4">
                {filteredDoctors.length > 0 ? (
                  <>
                    {/* Featured Doctor */}
                    {mappedDoctors[0] && (
                      <DoctorCard
                        {...mappedDoctors[0]}
                        featured={true}
                        onViewProfile={persistUiState}
                      />
                    )}

                    {/* Rest of Doctors */}
                    {mappedDoctors.slice(1).map((doctor) => (
                      <DoctorCard key={doctor.id} {...doctor} onViewProfile={persistUiState} />
                    ))}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <Button onClick={handleReset} variant="outline">
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Map View */}
            {viewMode === "map" && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="h-[600px] relative">
                  <MapContainer
                    ref={(map) => {
                      mapRef.current = map;
                    }}
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={11}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Range Circle */}
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={searchFilters.range * 1000}
                      pathOptions={{ color: 'teal', fillColor: 'teal', fillOpacity: 0.1 }}
                    />

                    {/* Current location pointer */}
                    <Marker
                      position={[userLocation.lat, userLocation.lng]}
                      icon={currentLocationIcon}
                    >
                      <Popup>
                        <div className="text-sm font-medium">You are here</div>
                      </Popup>
                    </Marker>

                    {/* Doctor Markers */}
                    {mappedDoctors
                      .filter((doctor) => Number.isFinite(doctor.lat) && Number.isFinite(doctor.lng))
                      .map((doctor) => (
                      <Marker
                        key={doctor.id}
                        position={[doctor.lat, doctor.lng]}
                        eventHandlers={{
                          mouseover: (event) => event.target.openPopup(),
                          click: (event) => event.target.openPopup(),
                        }}
                      >
                        <Popup>
                          <div className="p-1.5 w-48 text-xs">
                            {(() => {
                              const distanceKm = haversineDistanceKm(
                                userLocation.lat,
                                userLocation.lng,
                                doctor.lat,
                                doctor.lng
                              );
                              const walkMins = (distanceKm / 5) * 60;
                              const bikeMins = (distanceKm / 15) * 60;
                              const carMins = (distanceKm / 40) * 60;
                              return (
                                <>
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-xs text-teal-600">{doctor.specialization}</p>
                            <p className="text-xs text-gray-600 truncate">{doctor.location}</p>
                            <p className="text-xs font-medium mt-1">
                              {doctor.fee === null ? "Fee not set" : `$${doctor.fee}/session`}
                            </p>
                            <p className="text-[11px] text-gray-600 mt-1">
                              Distance: {distanceKm.toFixed(1)} km
                            </p>
                            <div className="text-[10px] text-gray-600 mt-1 space-y-0.5">
                              <p>Walk: {formatMinutes(walkMins)}</p>
                              <p>Bike: {formatMinutes(bikeMins)}</p>
                              <p>Car: {formatMinutes(carMins)}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] px-1 h-7"
                                onClick={() => openNavigation(doctor, "walk")}
                              >
                                Walk
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] px-1 h-7"
                                onClick={() => openNavigation(doctor, "bike")}
                              >
                                Bike
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] px-1 h-7"
                                onClick={() => openNavigation(doctor, "car")}
                              >
                                Car
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              className="w-full mt-2 bg-teal-600 h-8 text-xs"
                              onClick={() => {
                                persistUiState();
                                navigate(`/user/doctor/${doctor.id}`);
                              }}
                            >
                              View Profile
                            </Button>
                                </>
                              );
                            })()}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Current Location Button */}
                  <Button
                    className="absolute bottom-4 right-4 z-[1000] bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                    onClick={handleLocateMe}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    My Location
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

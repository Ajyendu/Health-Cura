import { useState, useMemo, useEffect, useCallback } from "react";
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
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function UserHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [rangeKm, setRangeKm] = useState([25]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    specialization: "All Specializations",
    date: "",
    range: 25,
    lat: "",
    lng: "",
  });

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

  const handleSearch = () => {
    setSearchFilters({
      search: searchTerm,
      specialization: selectedSpecialization,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      range: rangeKm[0],
      lat: String(userLocation.lat),
      lng: String(userLocation.lng),
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSpecialization("All Specializations");
    setSelectedDate(undefined);
    setRangeKm([25]);
    setSearchFilters({
      search: "",
      specialization: "All Specializations",
      date: "",
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
  }, []);

  useEffect(() => {
    if (!searchFilters.lat || !searchFilters.lng) return;
    loadDoctors();
  }, [loadDoctors, searchFilters.lat, searchFilters.lng]);

  const filteredDoctors = useMemo(() => doctors, [doctors]);

  const mappedDoctors = useMemo(
    () =>
      filteredDoctors.map((doctor) => ({
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        image: doctor.photoUrl
          ? `${
              (import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1").replace(
                /\/api\/v1\/?$/,
                ""
              )
            }${doctor.photoUrl}`
          : "https://via.placeholder.com/200x200?text=Doctor",
        location: doctor.locationName || "Clinic location",
        fee: doctor.consultationFee || 0,
        experience: doctor.yearsExperience || 0,
        rating: doctor.ratingAverage || 0,
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
                      />
                    )}

                    {/* Rest of Doctors */}
                    {mappedDoctors.slice(1).map((doctor) => (
                      <DoctorCard key={doctor.id} {...doctor} />
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

                    {/* Doctor Markers */}
                    {mappedDoctors
                      .filter((doctor) => Number.isFinite(doctor.lat) && Number.isFinite(doctor.lng))
                      .map((doctor) => (
                      <Marker key={doctor.id} position={[doctor.lat, doctor.lng]}>
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-sm text-teal-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-600">{doctor.location}</p>
                            <p className="text-sm font-medium mt-1">${doctor.fee}/session</p>
                            <Button
                              size="sm"
                              className="w-full mt-2 bg-teal-600"
                              onClick={() => navigate(`/user/doctor/${doctor.id}`)}
                            >
                              View Profile
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Current Location Button */}
                  <Button
                    className="absolute bottom-4 right-4 z-[1000] bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                    onClick={() => handleReset()}
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

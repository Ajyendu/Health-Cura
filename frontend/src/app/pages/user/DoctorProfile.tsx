import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { UserNav } from "../../components/UserNav";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  MapPin,
  Star,
  DollarSign,
  Clock,
  Award,
  Languages,
  Building2,
  ArrowLeft,
  Calendar,
  Check,
  Car,
  Bike,
  Footprints
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { appointmentsApi, doctorsApi, profileApi } from "@/shared/api/services";
import { backendOrigin } from "@/shared/api/envPublic";
import { withDrPrefix } from "@/shared/utils/doctorName";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FitNavigationBounds({
  doctorLat,
  doctorLng,
  currentLocation,
}: {
  doctorLat: number;
  doctorLng: number;
  currentLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.fitBounds(
        [
          [doctorLat, doctorLng],
          [currentLocation.lat, currentLocation.lng],
        ],
        { padding: [36, 36] }
      );
      return;
    }
    map.setView([doctorLat, doctorLng], 13);
  }, [map, doctorLat, doctorLng, currentLocation]);

  return null;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const [doctor, setDoctor] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientProfile, setPatientProfile] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const apiOrigin = useMemo(() => backendOrigin(), []);

  useEffect(() => {
    if (!id) return;
    doctorsApi
      .getById(id)
      .then((payload) => setDoctor(payload.data))
      .catch((error: any) => toast.error(error?.message || "Failed to load doctor"));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileApi
      .getProfile()
      .then((payload) => {
        const members = payload?.data?.patientProfiles || [];
        setProfiles(members);
        if (members[0]?._id) setPatientProfile(members[0]._id);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!id) return;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const payload = await doctorsApi.slots(id, format(selectedDate, "yyyy-MM-dd"));
        setSlots(payload?.data || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [id, selectedDate]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => {}
    );
  }, []);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Doctor not found</h2>
          <Button onClick={() => navigate("/user/home")} className="mt-4">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const bookingReadiness = doctor?.bookingReadiness;
  const isDoctorBookable = bookingReadiness?.bookable !== false;

  const handleBookAppointment = () => {
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    if (!patientProfile) {
      toast.error("Please select a patient profile");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for visit");
      return;
    }
    if (!isDoctorBookable) {
      toast.error("This doctor profile is not ready for booking yet");
      return;
    }
    appointmentsApi
      .create({
        doctorId: id,
        patientProfileId: patientProfile,
        startAt: selectedTime,
        reason,
      })
      .then(() => {
        toast.success("Appointment booked successfully");
        navigate("/user/appointments?tab=upcoming");
      })
      .catch((error: any) => toast.error(error?.message || "Booking failed"));
  };

  const doctorLat = doctor?.location?.coordinates?.[1];
  const doctorLng = doctor?.location?.coordinates?.[0];
  const canNavigate =
    currentLocation &&
    Number.isFinite(Number(currentLocation.lat)) &&
    Number.isFinite(Number(currentLocation.lng)) &&
    Number.isFinite(Number(doctorLat)) &&
    Number.isFinite(Number(doctorLng));

  const getDistanceKm = () => {
    if (!canNavigate) return 0;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(Number(doctorLat) - currentLocation.lat);
    const dLng = toRad(Number(doctorLng) - currentLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(currentLocation.lat)) *
        Math.cos(toRad(Number(doctorLat))) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const formatMins = (mins: number) => {
    if (!Number.isFinite(mins) || mins < 1) return "< 1 min";
    if (mins < 60) return `${Math.round(mins)} min`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  const openNavigation = (mode: "walk" | "bike" | "car") => {
    if (!canNavigate) {
      toast.error("Location data unavailable for navigation");
      return;
    }
    const travelMode =
      mode === "walk" ? "walking" : mode === "bike" ? "bicycling" : "driving";
    const origin = `${currentLocation!.lat},${currentLocation!.lng}`;
    const destination = `${doctorLat},${doctorLng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Doctor Info - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card className="p-8">
              <div className="flex gap-6">
                <img
                  src={
                    doctor.photoUrl
                      ? `${apiOrigin}${doctor.photoUrl}`
                      : "https://via.placeholder.com/240x240?text=Doctor"
                  }
                  alt={doctor.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{withDrPrefix(doctor.name)}</h1>
                  <p className="text-xl text-teal-600 font-medium mb-3">
                    {doctor.specialization}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{doctor.hospital || "Hospital"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.locationName || "Clinic location"}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-teal-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-teal-600 mb-1">
                        <Star className="w-4 h-4 fill-teal-600" />
                        <span className="text-sm font-medium">Rating</span>
                      </div>
                      <p className="text-xl font-bold">
                        {doctor.ratingCount ? Number(doctor.ratingAverage || 0).toFixed(1) : "--"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {doctor.ratingCount ? `${doctor.ratingCount} reviews` : "No reviews yet"}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Experience</span>
                      </div>
                      <p className="text-xl font-bold">
                        {doctor.verified && doctor.yearsExperience !== null
                          ? doctor.yearsExperience
                          : "--"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {doctor.verified ? "years" : "pending verification"}
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Fee</span>
                      </div>
                      <p className="text-xl font-bold">
                        {doctor.consultationFee === null || doctor.consultationFee === undefined
                          ? "--"
                          : `$${doctor.consultationFee}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {doctor.consultationFee === null || doctor.consultationFee === undefined
                          ? "not set"
                          : "per session"}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <p className="text-sm font-bold">
                        {doctor.verified ? "Verified" : "Unverified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {doctor.verified ? "Licensed" : "Profile pending verification"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* About */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.bio || "No bio available."}</p>
            </Card>

            {/* Qualifications */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold">Qualifications</h2>
              </div>
              <ul className="space-y-2">
                {(Array.isArray(doctor.qualifications)
                  ? doctor.qualifications
                  : String(doctor.qualifications || "")
                      .split(/,|\n/)
                      .map((v) => v.trim())
                      .filter(Boolean)
                ).map((qual, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{qual}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Languages */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold">Languages Spoken</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(doctor.languages || []).map((lang: string) => (
                  <Badge key={lang} variant="secondary" className="text-sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Navigation */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Navigate to Clinic</h2>
              {Number.isFinite(Number(doctorLat)) && Number.isFinite(Number(doctorLng)) && (
                <div className="h-64 rounded-xl overflow-hidden border mb-4">
                  <MapContainer
                    center={[Number(doctorLat), Number(doctorLng)]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitNavigationBounds
                      doctorLat={Number(doctorLat)}
                      doctorLng={Number(doctorLng)}
                      currentLocation={currentLocation}
                    />
                    <Marker position={[Number(doctorLat), Number(doctorLng)]}>
                      <Popup>{withDrPrefix(doctor.name)} Clinic</Popup>
                    </Marker>
                    {currentLocation && (
                      <CircleMarker
                        center={[currentLocation.lat, currentLocation.lng]}
                        radius={8}
                        pathOptions={{
                          color: "#0ea5e9",
                          fillColor: "#38bdf8",
                          fillOpacity: 0.95,
                          weight: 2,
                        }}
                      >
                        <Popup>Your current location</Popup>
                      </CircleMarker>
                    )}
                  </MapContainer>
                </div>
              )}
              {canNavigate ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Distance: <span className="font-medium">{getDistanceKm().toFixed(1)} km</span>
                  </p>
                  <div className="grid md:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => openNavigation("walk")}>
                      <Footprints className="w-4 h-4 mr-2" />
                      Walk ({formatMins((getDistanceKm() / 5) * 60)})
                    </Button>
                    <Button variant="outline" onClick={() => openNavigation("bike")}>
                      <Bike className="w-4 h-4 mr-2" />
                      Bike ({formatMins((getDistanceKm() / 15) * 60)})
                    </Button>
                    <Button variant="outline" onClick={() => openNavigation("car")}>
                      <Car className="w-4 h-4 mr-2" />
                      Car ({formatMins((getDistanceKm() / 40) * 60)})
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Enable location access to see live travel time and directions.
                </p>
              )}
            </Card>
          </div>

          {/* Booking Panel - Right Column */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Book Appointment</h2>

              {/* Date Selection */}
              <div className="space-y-3 mb-6">
                <Label>Select Date</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => {
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    return (
                      <Button
                        key={date.toISOString()}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-3 flex flex-col ${
                          isSelected ? "bg-teal-600 hover:bg-teal-700" : ""
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="text-xs">{format(date, 'EEE')}</span>
                        <span className="text-lg font-bold">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM')}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3 mb-6">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {slots.map((slot) => {
                    const isSelected = selectedTime === slot.startAt;
                    const isBooked = !slot.isAvailable;
                    const remaining = Number(slot.remainingSlots ?? (slot.isAvailable ? 1 : 0));
                    return (
                      <Button
                        key={slot.startAt}
                        variant={isSelected ? "default" : "outline"}
                        className={`${
                          isSelected
                            ? "bg-teal-600 hover:bg-teal-700"
                            : isBooked
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => !isBooked && setSelectedTime(slot.startAt)}
                        disabled={isBooked}
                      >
                        <span className="flex flex-col items-center leading-tight">
                          <span>{slot.label}</span>
                          <span className="text-[10px] opacity-80">
                            {isBooked ? "Full" : `${remaining} left`}
                          </span>
                        </span>
                      </Button>
                    );
                  })}
                  {!loadingSlots && !slots.length && (
                    <p className="text-xs text-gray-500 col-span-2">
                      {isDoctorBookable
                        ? "No slots available. Doctor has not created slots for this day yet."
                        : "Booking disabled until doctor profile is verified and complete."}
                    </p>
                  )}
                </div>
              </div>

              {!isDoctorBookable && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mb-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">Booking unavailable</p>
                  <p className="text-xs text-amber-700">
                    Waiting for doctor profile completion and team verification.
                  </p>
                  {Array.isArray(bookingReadiness?.missing) && bookingReadiness.missing.length > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      Missing: {bookingReadiness.missing.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Patient Profile */}
              <div className="space-y-3 mb-6">
                <Label>Book For</Label>
                <Select value={patientProfile} onValueChange={setPatientProfile}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile._id} value={profile._id}>
                        {profile.name} ({profile.relation || "Self"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason for Visit */}
              <div className="space-y-3 mb-6">
                <Label>Reason for Visit</Label>
                <Textarea
                  placeholder="Describe your symptoms or reason for consultation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="rounded-xl"
                />
              </div>

              {/* Summary */}
              {selectedTime && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {format(new Date(selectedTime), 'MMM d, yyyy p')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium">
                      {doctor.consultationFee === null || doctor.consultationFee === undefined
                        ? "Not set"
                        : `$${doctor.consultationFee}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Button
                onClick={handleBookAppointment}
                disabled={!isDoctorBookable}
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90 rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                You can cancel or reschedule up to 24 hours before appointment
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

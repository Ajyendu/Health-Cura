import { useEffect, useMemo, useState } from "react";
import { DoctorNav } from "../../components/DoctorNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  DollarSign,
  Clock,
  Languages,
  Stethoscope,
  Camera,
  Save,
  CheckCircle2,
  LocateFixed,
} from "lucide-react";
import { toast } from "sonner";
import { doctorsApi } from "@/shared/api/services";
import { backendOrigin } from "@/shared/api/envPublic";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({
  editable,
  position,
  onPick,
}: {
  editable: boolean;
  position: { lat: number; lng: number };
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (!editable) return;
      onPick(
        Number(event.latlng.lat.toFixed(6)),
        Number(event.latlng.lng.toFixed(6))
      );
    },
  });
  return (
    <Marker
      draggable={editable}
      position={[position.lat, position.lng]}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const next = marker.getLatLng();
          onPick(Number(next.lat.toFixed(6)), Number(next.lng.toFixed(6)));
        },
      }}
    />
  );
}

export default function DoctorProfileManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Info
    name: "",
    email: "",
    phone: "",
    
    // Professional Info
    specialization: "",
    licenseNumber: "",
    experience: "",
    bio: "",
    
    // Qualifications
    qualifications: "",
    
    // Practice Details
    hospital: "",
    clinicAddress: "",
    consultationFee: "",
    licenseIssuedAt: "",
    
    // Languages
    languages: "",
    
    // Availability
    availabilityWeekly: [] as Array<{
      dayOfWeek: number;
      start: string;
      end: string;
      capacity: string;
    }>,
    lat: "",
    lng: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const apiOrigin = useMemo(() => backendOrigin(), []);

  useEffect(() => {
    doctorsApi
      .getMyProfile()
      .then((payload) => {
        const data = payload?.data;
        setProfileData((prev) => ({
          ...prev,
          name: data?.name || prev.name,
          email: data?.email || prev.email,
          phone: data?.contactPhone || prev.phone,
          specialization: data?.specialization || prev.specialization,
          licenseNumber: data?.licenseNumber || prev.licenseNumber,
          experience:
            data?.verified && data?.yearsExperience !== null && data?.yearsExperience !== undefined
              ? String(data.yearsExperience)
              : "",
          bio: data?.bio || prev.bio,
          qualifications: Array.isArray(data?.qualifications)
            ? data.qualifications.join("\n")
            : data?.qualifications || prev.qualifications,
          hospital: data?.hospital || prev.hospital,
          clinicAddress: data?.clinicAddress || prev.clinicAddress,
          consultationFee: String(data?.consultationFee ?? prev.consultationFee),
          licenseIssuedAt: data?.licenseIssuedAt
            ? new Date(data.licenseIssuedAt).toISOString().slice(0, 10)
            : prev.licenseIssuedAt,
          languages: (data?.languages || []).join(", "),
          availabilityWeekly: Array.isArray(data?.availabilityWeekly)
            ? data.availabilityWeekly
                .map((slot: any) => ({
                  dayOfWeek: Number(slot?.dayOfWeek),
                  start: String(slot?.start || ""),
                  end: String(slot?.end || ""),
                  capacity: String(slot?.capacity ?? ""),
                }))
                .filter(
                  (slot: any) =>
                    Number.isInteger(slot.dayOfWeek) &&
                    slot.dayOfWeek >= 0 &&
                    slot.dayOfWeek <= 6 &&
                    slot.start &&
                    slot.end &&
                    Number(slot.capacity) > 0
                )
            : [],
          lat: String(data?.location?.coordinates?.[1] ?? ""),
          lng: String(data?.location?.coordinates?.[0] ?? ""),
        }));
        setPhotoUrl(data?.photoUrl || "");
        setIsVerified(Boolean(data?.verified));
      })
      .catch(() => {});
  }, []);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("specialization", profileData.specialization);
      if (profileData.consultationFee !== "") {
        formData.append("consultationFee", profileData.consultationFee);
      }
      formData.append("bio", profileData.bio);
      formData.append("qualifications", profileData.qualifications);
      formData.append("licenseNumber", profileData.licenseNumber);
      formData.append("licenseIssuedAt", profileData.licenseIssuedAt);
      formData.append("contactPhone", profileData.phone);
      formData.append("clinicAddress", profileData.clinicAddress);
      formData.append("hospital", profileData.hospital);
      formData.append("languages", profileData.languages);
      const normalizedAvailability = profileData.availabilityWeekly
        .filter((slot) => slot.start && slot.end && Number(slot.capacity) > 0)
        .map((slot) => ({
          dayOfWeek: Number(slot.dayOfWeek),
          start: slot.start,
          end: slot.end,
          capacity: Number(slot.capacity),
        }));
      formData.append("availabilityWeekly", JSON.stringify(normalizedAvailability));
      if (profileData.lat && profileData.lng) {
        formData.append("lat", profileData.lat);
        formData.append("lng", profileData.lng);
      }
      if (photo) formData.append("photo", photo);
      const payload = await doctorsApi.updateMyProfile(formData);
      if (payload?.data?.photoUrl) {
        setPhotoUrl(payload.data.photoUrl);
      }
      setIsVerified(Boolean(payload?.data?.verified));
      setIsEditing(false);
      setSavedSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error?.message || "Unable to save profile");
    }
  };

  const toggleDayAvailability = (dayOfWeek: number) => {
    const exists = profileData.availabilityWeekly.some((slot) => slot.dayOfWeek === dayOfWeek);
    if (exists) {
      setProfileData((prev) => ({
        ...prev,
        availabilityWeekly: prev.availabilityWeekly.filter((slot) => slot.dayOfWeek !== dayOfWeek),
      }));
      return;
    }
    setProfileData((prev) => ({
      ...prev,
      availabilityWeekly: [
        ...prev.availabilityWeekly,
        { dayOfWeek, start: "", end: "", capacity: "1" },
      ],
    }));
  };

  const updateDayField = (
    dayOfWeek: number,
    key: "start" | "end" | "capacity",
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      availabilityWeekly: prev.availabilityWeekly.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [key]: value } : slot
      ),
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfileData((prev) => ({
          ...prev,
          lat: String(Number(position.coords.latitude.toFixed(6))),
          lng: String(Number(position.coords.longitude.toFixed(6))),
        }));
        toast.success("Current location pinned on map");
      },
      () => toast.error("Unable to fetch current location"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const mapPosition = useMemo(() => {
    const lat = Number(profileData.lat);
    const lng = Number(profileData.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
    return { lat: 20.5937, lng: 78.9629 };
  }, [profileData.lat, profileData.lng]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Management</h1>
            <p className="text-gray-600">Update your professional information and settings</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {savedSuccess && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">Your profile has been updated successfully!</p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Photo Card */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {photoUrl ? (
                  <img
                    src={`${apiOrigin}${photoUrl}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-2xl object-cover mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 mx-auto flex items-center justify-center text-gray-500 text-sm">
                    No Photo
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-lg cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{profileData.name}</h2>
              <p className="text-teal-600 font-medium mb-3">{profileData.specialization}</p>
              <Badge className={isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                {isVerified ? "Verified Doctor" : "Unverified"}
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {profileData.experience
                    ? `${profileData.experience} years experience`
                    : "Experience updates after license verification"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {profileData.consultationFee
                    ? `$${profileData.consultationFee} per session`
                    : "Consultation fee not set"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{profileData.hospital}</span>
              </div>
            </div>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Medical License Number</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.licenseNumber}
                      onChange={(e) =>
                        setProfileData({ ...profileData, licenseNumber: e.target.value })
                      }
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>License Issued Date</Label>
                  <Input
                    type="date"
                    value={profileData.licenseIssuedAt}
                    onChange={(e) =>
                      setProfileData({ ...profileData, licenseIssuedAt: e.target.value })
                    }
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </Card>

            {/* Professional Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Professional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    value={profileData.specialization}
                    onChange={(e) =>
                      setProfileData({ ...profileData, specialization: e.target.value })
                    }
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={profileData.experience}
                      disabled
                      placeholder="Will appear after license verification"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Calculated automatically from verified license issued date.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Languages Spoken</Label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.languages}
                      onChange={(e) =>
                        setProfileData({ ...profileData, languages: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., English, Spanish, French"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Qualifications (one per line)</Label>
                  <Textarea
                    value={profileData.qualifications}
                    onChange={(e) =>
                      setProfileData({ ...profileData, qualifications: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </Card>

            {/* Practice & Clinic Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Practice & Clinic Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hospital/Clinic Name</Label>
                  <Input
                    value={profileData.hospital}
                    onChange={(e) => setProfileData({ ...profileData, hospital: e.target.value })}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={profileData.consultationFee}
                      onChange={(e) =>
                        setProfileData({ ...profileData, consultationFee: e.target.value })
                      }
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Clinic Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.clinicAddress}
                      onChange={(e) =>
                        setProfileData({ ...profileData, clinicAddress: e.target.value })
                      }
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    value={profileData.lat}
                    onChange={(e) => setProfileData({ ...profileData, lat: e.target.value })}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    value={profileData.lng}
                    onChange={(e) => setProfileData({ ...profileData, lng: e.target.value })}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Pick Clinic Location on Map</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseCurrentLocation}
                      disabled={!isEditing}
                    >
                      <LocateFixed className="w-4 h-4 mr-2" />
                      Use Current Location
                    </Button>
                  </div>
                  <div className="h-56 rounded-xl overflow-hidden border">
                    <MapContainer
                      key={`${mapPosition.lat}-${mapPosition.lng}`}
                      center={[mapPosition.lat, mapPosition.lng]}
                      zoom={profileData.lat && profileData.lng ? 13 : 4}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        editable={isEditing}
                        position={mapPosition}
                        onPick={(lat, lng) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lat: String(lat),
                            lng: String(lng),
                          }))
                        }
                      />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-gray-500">
                    Click map or drag marker to set location.
                  </p>
                </div>
              </div>
            </Card>

            {/* Availability */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Availability
              </h3>
              <div className="space-y-3">
                <Label>Slot windows (default blank)</Label>
                <div className="space-y-2">
                  {WEEK_DAYS.map((day) => {
                    const row = profileData.availabilityWeekly.find(
                      (slot) => slot.dayOfWeek === day.value
                    );
                    const enabled = Boolean(row);
                    return (
                      <div key={day.value} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => isEditing && toggleDayAvailability(day.value)}
                            disabled={!isEditing}
                          />
                          <span className="text-sm">{day.label}</span>
                        </div>
                        <Input
                          type="time"
                          value={row?.start || ""}
                          onChange={(e) => updateDayField(day.value, "start", e.target.value)}
                          disabled={!isEditing || !enabled}
                          className="col-span-3 rounded-xl"
                        />
                        <Input
                          type="time"
                          value={row?.end || ""}
                          onChange={(e) => updateDayField(day.value, "end", e.target.value)}
                          disabled={!isEditing || !enabled}
                          className="col-span-3 rounded-xl"
                        />
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={row?.capacity || ""}
                          onChange={(e) => updateDayField(day.value, "capacity", e.target.value)}
                          disabled={!isEditing || !enabled}
                          className="col-span-3 rounded-xl"
                          placeholder="slots"
                        />
                      </div>
                    );
                  })}
                </div>
                {isEditing && (
                  <p className="text-sm text-gray-600">
                    Enable day and set start, end, and slot count (e.g. 11:00-11:30 with 5 slots).
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Slot count is per time window and controls how many patients can book that slot.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

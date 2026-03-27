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
} from "lucide-react";
import { toast } from "sonner";
import { doctorsApi } from "@/shared/api/services";

export default function DoctorProfileManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Info
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@healthcura.com",
    phone: "+1 (555) 987-6543",
    
    // Professional Info
    specialization: "Cardiology",
    licenseNumber: "NY-MD-123456",
    experience: "12",
    bio: "Board-certified cardiologist with over 12 years of experience in treating heart conditions. Specialized in preventive cardiology and interventional procedures. Committed to providing comprehensive cardiac care with a patient-centered approach.",
    
    // Qualifications
    qualifications: "MD - Harvard Medical School\nFellowship - Johns Hopkins\nBoard Certified - American Board of Internal Medicine",
    
    // Practice Details
    hospital: "Mount Sinai Hospital",
    clinicAddress: "1468 Madison Ave, New York, NY 10029",
    consultationFee: "250",
    slotDuration: "30",
    
    // Languages
    languages: "English, Spanish",
    
    // Availability
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const apiOrigin = useMemo(
    () =>
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1").replace(
        /\/api\/v1\/?$/,
        ""
      ),
    []
  );

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
          experience: String(data?.yearsExperience ?? prev.experience),
          bio: data?.bio || prev.bio,
          qualifications: Array.isArray(data?.qualifications)
            ? data.qualifications.join("\n")
            : data?.qualifications || prev.qualifications,
          hospital: data?.hospital || prev.hospital,
          clinicAddress: data?.clinicAddress || prev.clinicAddress,
          consultationFee: String(data?.consultationFee ?? prev.consultationFee),
          slotDuration: String(data?.slotDurationMinutes ?? prev.slotDuration),
          languages: (data?.languages || []).join(", "),
        }));
        setPhotoUrl(data?.photoUrl || "");
      })
      .catch(() => {});
  }, []);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("specialization", profileData.specialization);
      formData.append("yearsExperience", profileData.experience);
      formData.append("consultationFee", profileData.consultationFee);
      formData.append("bio", profileData.bio);
      formData.append("qualifications", profileData.qualifications);
      formData.append("licenseNumber", profileData.licenseNumber);
      formData.append("contactPhone", profileData.phone);
      formData.append("clinicAddress", profileData.clinicAddress);
      formData.append("hospital", profileData.hospital);
      formData.append("slotDurationMinutes", profileData.slotDuration);
      formData.append("languages", profileData.languages);
      if (photo) formData.append("photo", photo);
      const payload = await doctorsApi.updateMyProfile(formData);
      if (payload?.data?.photoUrl) {
        setPhotoUrl(payload.data.photoUrl);
      }
      setIsEditing(false);
      setSavedSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error?.message || "Unable to save profile");
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    if (profileData.availableDays.includes(day)) {
      setProfileData({
        ...profileData,
        availableDays: profileData.availableDays.filter((d) => d !== day),
      });
    } else {
      setProfileData({
        ...profileData,
        availableDays: [...profileData.availableDays, day],
      });
    }
  };

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
                <img
                  src={
                    photoUrl
                      ? `${apiOrigin}${photoUrl}`
                      : "https://images.unsplash.com/photo-1734002886107-168181bcd6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl object-cover mx-auto"
                />
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
              <Badge className="bg-green-100 text-green-700">Verified Doctor</Badge>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{profileData.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">${profileData.consultationFee} per session</span>
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
                      onChange={(e) =>
                        setProfileData({ ...profileData, experience: e.target.value })
                      }
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
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
                  <Label>Appointment Slot Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={profileData.slotDuration}
                      onChange={(e) =>
                        setProfileData({ ...profileData, slotDuration: e.target.value })
                      }
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
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
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={profileData.availableDays.includes(day) ? "default" : "outline"}
                      onClick={() => isEditing && toggleDay(day)}
                      disabled={!isEditing}
                      className={
                        profileData.availableDays.includes(day)
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
                {isEditing && (
                  <p className="text-sm text-gray-600">
                    Click on days to toggle availability
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

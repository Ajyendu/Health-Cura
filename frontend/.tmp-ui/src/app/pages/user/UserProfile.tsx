import { useEffect, useState } from "react";
import { UserNav } from "../../components/UserNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { User, Users, Mail, Phone, MapPin, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/shared/api/services";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
}

export default function UserProfile() {
  const [userProfileId, setUserProfileId] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Other",
    bloodGroup: "",
    address: "",
    age: "",
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
  });

  const loadProfile = async () => {
    try {
      const payload = await profileApi.getProfile();
      const data = payload?.data;
      setUserProfileId(data?._id || "");
      setPersonalInfo({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.contact || "",
        dateOfBirth: "",
        gender: data?.gender || "Other",
        bloodGroup: "",
        address: "",
        age: data?.age ? String(data.age) : "",
      });
      setFamilyMembers(
        (data?.patientProfiles || []).map((member: any) => ({
          id: member._id,
          name: member.name || "",
          relationship: member.relation || "",
          dateOfBirth: "",
          gender: member.gender || "",
          bloodGroup: "",
        }))
      );
    } catch (error: any) {
      toast.error(error?.message || "Unable to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSavePersonalInfo = async () => {
    try {
      await profileApi.updateProfile({
        name: personalInfo.name,
        age: Number(personalInfo.age || 0),
        gender: personalInfo.gender.toLowerCase(),
        contact: personalInfo.phone,
      });
      setIsEditingPersonal(false);
      toast.success("Profile updated successfully");
      loadProfile();
    } catch (error: any) {
      toast.error(error?.message || "Profile update failed");
    }
  };

  const handleAddFamilyMember = async () => {
    try {
      await profileApi.createPatientProfile({
        userProfileId,
        name: newMember.name,
        age: 0,
        gender: (newMember.gender || "other").toLowerCase(),
        relation: newMember.relationship,
        contact: "",
      });
      setNewMember({
        name: "",
        relationship: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
      });
      toast.success("Family member added successfully");
      loadProfile();
    } catch (error: any) {
      toast.error(error?.message || "Unable to add family member");
    }
  };

  const handleDeleteFamilyMember = async (id: string) => {
    try {
      await profileApi.deletePatientProfile(id);
      toast.success("Family member removed");
      loadProfile();
    } catch (error: any) {
      toast.error(error?.message || "Unable to remove family member");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal and family information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="family">
              <Users className="w-4 h-4 mr-2" />
              Family Profiles
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card className="p-6 max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                {!isEditingPersonal ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPersonal(true)}
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingPersonal(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePersonalInfo}
                      className="bg-gradient-to-r from-teal-600 to-blue-600"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, name: e.target.value })
                      }
                      disabled={!isEditingPersonal}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, email: e.target.value })
                      }
                      disabled={!isEditingPersonal}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phone: e.target.value })
                      }
                      disabled={!isEditingPersonal}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="dob"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })
                      }
                      disabled={!isEditingPersonal}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={personalInfo.gender}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, gender: e.target.value })
                    }
                    disabled={!isEditingPersonal}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input
                    id="bloodGroup"
                    value={personalInfo.bloodGroup}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, bloodGroup: e.target.value })
                    }
                    disabled={!isEditingPersonal}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, address: e.target.value })
                      }
                      disabled={!isEditingPersonal}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Family Profiles Tab */}
          <TabsContent value="family" className="space-y-6">
            {/* Add Family Member Dialog */}
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                    <DialogDescription>
                      Add a family member to book appointments on their behalf
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Full name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input
                        placeholder="e.g., Spouse, Child, Parent"
                        value={newMember.relationship}
                        onChange={(e) =>
                          setNewMember({ ...newMember, relationship: e.target.value })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={newMember.dateOfBirth}
                        onChange={(e) =>
                          setNewMember({ ...newMember, dateOfBirth: e.target.value })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Input
                        placeholder="Male/Female/Other"
                        value={newMember.gender}
                        onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Input
                        placeholder="e.g., A+, O-, B+"
                        value={newMember.bloodGroup}
                        onChange={(e) =>
                          setNewMember({ ...newMember, bloodGroup: e.target.value })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleAddFamilyMember}
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-600"
                      disabled={!newMember.name || !newMember.relationship}
                    >
                      Add Member
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Family Members List */}
            <div className="grid md:grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteFamilyMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-medium">{member.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{member.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <span className="font-medium">{member.bloodGroup}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4 rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Card>
              ))}
            </div>

            {familyMembers.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No family members added</h3>
                <p className="text-gray-600">
                  Add family members to easily book appointments on their behalf
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { UserNav } from "../../components/UserNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Plus,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { profileApi, recordsApi } from "@/shared/api/services";

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: Date;
  uploadedBy: string;
  doctorName?: string;
  tags: string[];
  fileSize: string;
  fileType: string;
  notes?: string;
}

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [newRecord, setNewRecord] = useState({
    title: "",
    type: "",
    tags: "",
    notes: "",
  });

  const recordTypes = ["All", "Lab Report", "Imaging", "Prescription", "Medical History", "Other"];

  const loadRecords = async (patientProfileId?: string) => {
    try {
      const payload = await recordsApi.list({
        patientProfileId: patientProfileId || selectedProfileId || undefined,
        page: 1,
        limit: 100,
      });
      setRecords(
        (payload?.data || []).map((record: any) => ({
          id: record._id,
          title: record.originalName || "Medical Record",
          type: record.mimeType?.startsWith("image/")
            ? "Imaging"
            : "Lab Report",
          date: new Date(record.createdAt),
          uploadedBy: "Self",
          doctorName: "",
          tags: Array.isArray(record.tags) ? record.tags : [],
          fileSize: `${Math.max(1, Math.round((record.fileSize || 0) / 1024))} KB`,
          fileType: record.mimeType || "file",
          notes: record.notes || "",
        }))
      );
    } catch (error: any) {
      toast.error(error?.message || "Unable to load records");
    }
  };

  useEffect(() => {
    profileApi
      .getProfile()
      .then((payload) => {
        const members = payload?.data?.patientProfiles || [];
        setProfiles(members);
        const firstProfile = members[0]?._id || "";
        setSelectedProfileId(firstProfile);
        if (firstProfile) loadRecords(firstProfile);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProfileId) return;
    loadRecords(selectedProfileId);
  }, [selectedProfileId]);

  const handleDeleteRecord = (id: string) => {
    recordsApi
      .delete(id)
      .then(() => {
        toast.success("Record deleted successfully");
        loadRecords();
      })
      .catch((error: any) => toast.error(error?.message || "Delete failed"));
  };

  const handleDownload = (record: MedicalRecord) => {
    window.open(recordsApi.downloadUrl(record.id), "_blank", "noopener,noreferrer");
  };

  const handleView = (record: MedicalRecord) => {
    toast.info(`Opening ${record.title}...`);
  };

  const handleUpload = () => {
    if (!selectedProfileId || !selectedFile) {
      toast.error("Select a profile and file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientProfileId", selectedProfileId);
    formData.append("notes", newRecord.notes);
    recordsApi
      .upload(formData)
      .then(() => {
        setNewRecord({ title: "", type: "", tags: "", notes: "" });
        setSelectedFile(null);
        toast.success("Record uploaded successfully");
        loadRecords();
      })
      .catch((error: any) => toast.error(error?.message || "Upload failed"));
  };

  const filteredRecords = useMemo(() => records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "All" || record.type === selectedType;
    return matchesSearch && matchesType;
  }), [records, searchTerm, selectedType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
            <p className="text-gray-600">Manage and organize your health documents</p>
          </div>

          {/* Upload Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
                <DialogDescription>
                  Upload a new medical document to your records
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Patient Profile</Label>
                  <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select profile" />
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
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    placeholder="e.g., Blood Test Results"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    placeholder="e.g., Lab Report, Prescription"
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    placeholder="e.g., Cardiology, Lab Report"
                    value={newRecord.tags}
                    onChange={(e) => setNewRecord({ ...newRecord, tags: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Additional notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600"
                  disabled={!newRecord.title || !newRecord.type || !selectedProfileId || !selectedFile}
                >
                  Upload Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search records by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="w-full md:w-72">
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Filter by profile" />
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recordTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={
                    selectedType === type
                      ? "bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
                      : "whitespace-nowrap"
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {records.filter((r) => r.type === "Lab Report").length}
                </p>
                <p className="text-sm text-gray-600">Lab Reports</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {records.filter((r) => r.type === "Imaging").length}
                </p>
                <p className="text-sm text-gray-600">Imaging</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {records.filter((r) => r.type === "Prescription").length}
                </p>
                <p className="text-sm text-gray-600">Prescriptions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Record Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{record.title}</h3>
                        <Badge variant="secondary">{record.type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleView(record)}
                          className="text-teal-600 hover:bg-teal-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(record)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(record.date, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Uploaded by {record.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>
                          {record.fileType} • {record.fileSize}
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                        {record.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {record.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No records found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedType !== "All"
                  ? "Try adjusting your search or filters"
                  : "Upload your first medical record to get started"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

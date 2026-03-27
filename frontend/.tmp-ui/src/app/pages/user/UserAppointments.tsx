import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { UserNav } from "../../components/UserNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  RotateCcw,
  Video,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { appointmentsApi } from "@/shared/api/services";

interface AppointmentVm {
  id: string;
  doctorName: string;
  doctorImage: string;
  specialization: string;
  date: Date;
  time: string;
  location: string;
  reason: string;
  fee: number;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
  type: "in-person" | "video";
}

export default function UserAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentVm[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const apiOrigin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1").replace(
    /\/api\/v1\/?$/,
    ""
  );

  const loadAppointments = async () => {
    try {
      const payload = await appointmentsApi.list({ page: 1, limit: 100 });
      const data = (payload?.data || []).map((appt: any) => ({
        id: appt._id,
        doctorName: appt.doctorSnapshot?.name || "Doctor",
        doctorImage: appt.doctorSnapshot?.photoUrl
          ? `${apiOrigin}${appt.doctorSnapshot.photoUrl}`
          : "https://via.placeholder.com/120x120?text=Dr",
        specialization: appt.doctorSnapshot?.specialization || "General",
        date: new Date(appt.startAt),
        time: format(new Date(appt.startAt), "p"),
        location: appt.doctorSnapshot?.locationName || "Clinic",
        reason: appt.reason || "General consultation",
        fee: appt.doctorSnapshot?.consultationFee || 0,
        status:
          appt.status === "scheduled"
            ? "upcoming"
            : (appt.status as "upcoming" | "completed" | "cancelled" | "rescheduled"),
        type: appt.mode === "video" ? "video" : "in-person",
      }));
      setAppointments(data);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancelAppointment = (id: string) => {
    appointmentsApi
      .cancel(id)
      .then(() => {
        toast.success("Appointment cancelled successfully");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Cancel failed"));
  };

  const handleRescheduleAppointment = (id: string) => {
    toast.info("Rescheduling feature - opening calendar...");
    // In a real app, this would open a rescheduling dialog
  };

  const getStatusBadge = (status: AppointmentVm["status"]) => {
    const variants = {
      upcoming: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      rescheduled: "bg-yellow-100 text-yellow-700",
    };
    return variants[status];
  };

  const filteredAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === activeTab),
    [appointments, activeTab]
  );

  const AppointmentCard = ({ appointment }: { appointment: AppointmentVm }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* Doctor Image */}
        <div className="flex-shrink-0">
          <img
            src={appointment.doctorImage}
            alt={appointment.doctorName}
            className="w-20 h-20 rounded-xl object-cover"
          />
        </div>

        {/* Appointment Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
              <p className="text-teal-600 font-medium">{appointment.specialization}</p>
            </div>
            <Badge className={getStatusBadge(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(appointment.date, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              {appointment.type === "video" ? (
                <Video className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span className="truncate">{appointment.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>${appointment.fee}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm">
              <span className="font-medium">Reason: </span>
              {appointment.reason}
            </p>
          </div>

          {/* Actions */}
          {appointment.status === "upcoming" && (
            <div className="flex gap-2">
              {appointment.type === "video" && (
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Video className="w-4 h-4 mr-1" />
                  Join Video Call
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRescheduleAppointment(appointment.id)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this appointment with{" "}
                      {appointment.doctorName}?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline">No, Keep It</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Yes, Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {appointment.status === "completed" && (
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4 mr-1" />
              Leave a Review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12">
            <TabsTrigger value="upcoming" className="text-sm">
              Upcoming ({appointments.filter((a) => a.status === "upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed ({appointments.filter((a) => a.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm">
              Cancelled ({appointments.filter((a) => a.status === "cancelled").length})
            </TabsTrigger>
            <TabsTrigger value="rescheduled" className="text-sm">
              Rescheduled ({appointments.filter((a) => a.status === "rescheduled").length})
            </TabsTrigger>
          </TabsList>

          {["upcoming", "completed", "cancelled", "rescheduled"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No {tab} appointments</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any {tab} appointments at the moment
                  </p>
                  {tab === "upcoming" && (
                    <Button
                      onClick={() => navigate("/user/home")}
                      className="bg-gradient-to-r from-teal-600 to-blue-600"
                    >
                      Find a Doctor
                    </Button>
                  )}
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

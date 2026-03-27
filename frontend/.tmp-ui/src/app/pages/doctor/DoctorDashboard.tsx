import { useEffect, useMemo, useState } from "react";
import { DoctorNav } from "../../components/DoctorNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { appointmentsApi } from "@/shared/api/services";

interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: Date;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
  type: "in-person" | "video";
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = async () => {
    try {
      const payload = await appointmentsApi.list({ page: 1, limit: 100 });
      const mapped = (payload?.data || []).map((appt: any) => ({
        id: appt._id,
        patientName: appt.patientSnapshot?.name || "Patient",
        patientAge: Number(appt.patientSnapshot?.age || 0),
        patientGender: appt.patientSnapshot?.gender || "Unknown",
        date: new Date(appt.startAt),
        time: format(new Date(appt.startAt), "p"),
        reason: appt.reason || "General consultation",
        status: appt.status === "upcoming" ? "scheduled" : appt.status,
        type: appt.mode === "video" ? "video" : "in-person",
      }));
      setAppointments(mapped);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleMarkCompleted = (id: string) => {
    appointmentsApi
      .complete(id)
      .then(() => {
        toast.success("Appointment marked as completed");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Action failed"));
  };

  const handleCancelAppointment = (id: string) => {
    appointmentsApi
      .cancel(id)
      .then(() => {
        toast.success("Appointment cancelled");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Action failed"));
  };

  const todayAppointments = appointments.filter(
    (apt) =>
      format(apt.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") &&
      apt.status === "scheduled"
  );

  const upcomingAppointments = appointments.filter((apt) => apt.status === "scheduled");
  const completedAppointments = appointments.filter((apt) => apt.status === "completed");
  const cancelledAppointments = appointments.filter((apt) => apt.status === "cancelled");

  const stats = useMemo(() => ({
    todayAppointments: todayAppointments.length,
    totalPatients: new Set(appointments.map((a) => a.patientName)).size,
    completedToday: completedAppointments.filter(
      (apt) => format(apt.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    ).length,
    earnings: "$0",
  }), [appointments, completedAppointments, todayAppointments.length]);

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-semibold">
            {appointment.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600">
              {appointment.patientAge} yrs • {appointment.patientGender}
            </p>
          </div>
        </div>
        <Badge
          className={
            appointment.status === "scheduled"
              ? "bg-blue-100 text-blue-700"
              : appointment.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(appointment.date, "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
          <MapPin className="w-4 h-4" />
          <span>{appointment.type === "video" ? "Video Consultation" : "In-Person"}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm">
          <span className="font-medium">Reason: </span>
          {appointment.reason}
        </p>
      </div>

      {appointment.status === "scheduled" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleMarkCompleted(appointment.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 hover:bg-red-50"
            onClick={() => handleCancelAppointment(appointment.id)}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. Mitchell</h1>
          <p className="text-gray-600">Here's what's happening with your practice today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.todayAppointments}</p>
            <p className="text-sm text-gray-600">Today's Appointments</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalPatients}</p>
            <p className="text-sm text-gray-600">Total Patients</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.completedToday}</p>
            <p className="text-sm text-gray-600">Completed Today</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.earnings}</p>
            <p className="text-sm text-gray-600">Monthly Earnings</p>
          </Card>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12">
            <TabsTrigger value="today">
              Today ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No appointments today</h3>
                <p className="text-gray-600">You have no appointments scheduled for today</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-gray-600">You have no upcoming appointments</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No completed appointments</h3>
                <p className="text-gray-600">No appointments have been completed yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledAppointments.length > 0 ? (
              cancelledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cancelled appointments</h3>
                <p className="text-gray-600">You have no cancelled appointments</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

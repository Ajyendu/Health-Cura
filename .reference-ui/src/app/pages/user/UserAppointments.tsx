import { useState } from "react";
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

interface Appointment {
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

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Sarah Mitchell",
    doctorImage: "https://images.unsplash.com/photo-1734002886107-168181bcd6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBzbWlsaW5nfGVufDF8fHx8MTc3Mzg3Mjc3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    specialization: "Cardiology",
    date: new Date("2026-03-25"),
    time: "10:00 AM",
    location: "Mount Sinai Hospital, New York",
    reason: "Routine checkup for heart condition",
    fee: 250,
    status: "upcoming",
    type: "in-person",
  },
  {
    id: "2",
    doctorName: "Dr. Emily Park",
    doctorImage: "https://images.unsplash.com/photo-1576669802218-d535933f897c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGRvY3RvciUyMG1lZGljYWx8ZW58MXx8fHwxNzczOTQzNjE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    specialization: "Pediatrics",
    date: new Date("2026-03-28"),
    time: "02:00 PM",
    location: "NewYork-Presbyterian, Manhattan",
    reason: "Child vaccination appointment",
    fee: 160,
    status: "upcoming",
    type: "video",
  },
  {
    id: "3",
    doctorName: "Dr. James Wilson",
    doctorImage: "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczODcyNzczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    specialization: "Orthopedics",
    date: new Date("2026-03-10"),
    time: "09:00 AM",
    location: "NYU Langone Health, Brooklyn",
    reason: "Follow-up for knee injury",
    fee: 200,
    status: "completed",
    type: "in-person",
  },
  {
    id: "4",
    doctorName: "Dr. Michael Chen",
    doctorImage: "https://images.unsplash.com/photo-1632054229795-4097870879b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczOTQzNjE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    specialization: "Dermatology",
    date: new Date("2026-02-15"),
    time: "03:00 PM",
    location: "Northwell Health, Queens",
    reason: "Skin consultation",
    fee: 180,
    status: "cancelled",
    type: "in-person",
  },
];

export default function UserAppointments() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleCancelAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelled" as const } : apt
      )
    );
    toast.success("Appointment cancelled successfully");
  };

  const handleRescheduleAppointment = (id: string) => {
    toast.info("Rescheduling feature - opening calendar...");
    // In a real app, this would open a rescheduling dialog
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const variants = {
      upcoming: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      rescheduled: "bg-yellow-100 text-yellow-700",
    };
    return variants[status];
  };

  const filteredAppointments = appointments.filter((apt) => apt.status === activeTab);

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
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
                      onClick={() => (window.location.href = "/user/home")}
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { UserNav } from "../../components/UserNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { appointmentsApi, doctorsApi } from "@/shared/api/services";
import { withDrPrefix } from "@/shared/utils/doctorName";

interface AppointmentVm {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorImage: string;
  specialization: string;
  date: Date;
  time: string;
  location: string;
  reason: string;
  fee: number | null;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
  type: "in-person" | "video";
}

export default function UserAppointments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<AppointmentVm[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [rescheduleTargetId, setRescheduleTargetId] = useState("");
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState<AppointmentVm | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const apiOrigin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api/v1").replace(
    /\/api\/v1\/?$/,
    ""
  );

  const loadAppointments = useCallback(async (silent = false) => {
    try {
      const payload = await appointmentsApi.list({ page: 1, limit: 100 });
      const data = (payload?.data || []).map((appt: any) => ({
        id: appt._id,
        doctorId: String(appt.doctorId || ""),
        doctorName: withDrPrefix(appt.doctorSnapshot?.name || "Doctor"),
        doctorImage: appt.doctorSnapshot?.photoUrl
          ? `${apiOrigin}${appt.doctorSnapshot.photoUrl}`
          : "https://via.placeholder.com/120x120?text=Dr",
        specialization: appt.doctorSnapshot?.specialization || "General",
        date: new Date(appt.startAt),
        time: format(new Date(appt.startAt), "p"),
        location: appt.doctorSnapshot?.locationName || "Clinic",
        reason: appt.reason || "General consultation",
        fee:
          appt.doctorSnapshot?.consultationFee === null ||
          appt.doctorSnapshot?.consultationFee === undefined
            ? null
            : Number(appt.doctorSnapshot?.consultationFee),
        status:
          appt.status === "pending" || appt.status === "scheduled"
            ? "upcoming"
            : (appt.status as "upcoming" | "completed" | "cancelled" | "rescheduled"),
        type: appt.mode === "video" ? "video" : "in-person",
      }));
      setAppointments(data);
    } catch (error: any) {
      if (!silent) {
        toast.error(error?.message || "Unable to load appointments");
      }
    }
  }, [apiOrigin]);

  useEffect(() => {
    loadAppointments();
    const intervalId = window.setInterval(() => {
      loadAppointments(true);
    }, 5000);
    const handleFocus = () => loadAppointments(true);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadAppointments(true);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    const unsubscribeRealtime = appointmentsApi.subscribe(
      () => loadAppointments(true),
      () => {}
    );
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribeRealtime();
    };
  }, [loadAppointments]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["upcoming", "completed", "cancelled", "rescheduled"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleCancelAppointment = (id: string) => {
    appointmentsApi
      .cancel(id)
      .then(() => {
        toast.success("Appointment cancelled successfully");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Cancel failed"));
  };

  const handleRescheduleAppointment = (appointment: AppointmentVm) => {
    const base = new Date(appointment.date);
    base.setDate(base.getDate() + 1);
    const localValue = new Date(base.getTime() - base.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setRescheduleTargetId(appointment.id);
    setRescheduleAt(localValue);
    setRescheduleDialogOpen(true);
  };

  const submitReschedule = () => {
    if (!rescheduleTargetId || !rescheduleAt) {
      toast.error("Please choose date and time");
      return;
    }
    appointmentsApi
      .reschedule(rescheduleTargetId, new Date(rescheduleAt).toISOString())
      .then(() => {
        toast.success("Appointment rescheduled successfully");
        setRescheduleDialogOpen(false);
        setRescheduleTargetId("");
        setRescheduleAt("");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Reschedule failed"));
  };

  const openReviewDialog = (appointment: AppointmentVm) => {
    setReviewAppointment(appointment);
    setReviewRating(5);
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  const submitReview = () => {
    if (!reviewAppointment) return;
    doctorsApi
      .addReview(reviewAppointment.doctorId, {
        appointmentId: reviewAppointment.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      .then(() => {
        toast.success("Review submitted successfully");
        setReviewDialogOpen(false);
        setReviewAppointment(null);
        setReviewComment("");
        loadAppointments();
      })
      .catch((error: any) => toast.error(error?.message || "Unable to submit review"));
  };

  const getStatusBadge = (status: AppointmentVm["status"]) => {
    const variants = {
      pending: "bg-amber-100 text-amber-700",
      upcoming: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      rescheduled: "bg-yellow-100 text-yellow-700",
    };
    return variants[status];
  };

  const filteredAppointments = useMemo(() => {
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toMs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;
    return appointments
      .filter((apt) => {
        const statusMatch = activeTab === "upcoming" ? apt.status === "upcoming" : apt.status === activeTab;
        if (!statusMatch) return false;
        const t = apt.date.getTime();
        if (fromMs !== null && t < fromMs) return false;
        if (toMs !== null && t > toMs) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime()
      );
  }, [appointments, activeTab, fromDate, toDate, sortOrder]);

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
              {appointment.status === "upcoming"
                ? "Booked"
                : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
              <span>{appointment.fee === null ? "Not set" : `$${appointment.fee}`}</span>
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
                onClick={() => handleRescheduleAppointment(appointment)}
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
            <Button size="sm" variant="outline" onClick={() => openReviewDialog(appointment)}>
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
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600">From date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">To date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Sort by date</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="asc">Oldest first</option>
                <option value="desc">Newest first</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setSortOrder("asc");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12">
            <TabsTrigger value="upcoming" className="text-sm">
              Booked ({appointments.filter((a) => a.status === "upcoming").length})
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
                  <h3 className="text-xl font-semibold mb-2">
                    No {tab === "upcoming" ? "booked" : tab} appointments
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any {tab === "upcoming" ? "booked" : tab} appointments at the
                    moment
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

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Pick a new available slot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <label className="text-sm font-medium">New Date and Time</label>
            <Input
              type="datetime-local"
              value={rescheduleAt}
              onChange={(event) => setRescheduleAt(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReschedule}>Confirm Reschedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Doctor</DialogTitle>
            <DialogDescription>
              Share your experience with {reviewAppointment?.doctorName || "the doctor"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={reviewRating === value ? "default" : "outline"}
                  onClick={() => setReviewRating(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <label className="text-sm font-medium">Comment</label>
            <Input
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Write your review..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReview}>Submit Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

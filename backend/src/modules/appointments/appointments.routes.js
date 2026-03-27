const express = require("express");
const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const Appointment = require("./appointment.model");
const User = require("../users/user.model");
const Doctor = require("../doctors/doctor.model");
const MedicalRecord = require("../medical-records/medicalRecord.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const { getPagination } = require("../../common/utils/pagination");
const {
  requireAuth,
  requireRole,
} = require("../../common/middleware/auth");
const { generateDoctorSlots } = require("../doctors/slot.service");
const { getDoctorBookingReadiness } = require("../doctors/bookingReadiness");
const {
  addAppointmentSubscriber,
  publishAppointmentEvent,
  sendSse,
} = require("./appointments.events");

const router = express.Router();

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.get(
  "/stream",
  requireAuth,
  (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    const unsubscribe = addAppointmentSubscriber({
      id: `${Date.now()}-${Math.random()}`,
      role: req.auth.role,
      authId: req.auth.id,
      res,
    });
    sendSse(res, "connected", {
      success: true,
      role: req.auth.role,
      at: new Date().toISOString(),
    });

    const pingInterval = setInterval(() => {
      res.write(": ping\n\n");
    }, 25000);

    req.on("close", () => {
      clearInterval(pingInterval);
      unsubscribe();
    });
  }
);

router.post(
  "/",
  requireAuth,
  requireRole("user"),
  [
    body("doctorId").custom(isObjectId),
    body("patientProfileId").custom(isObjectId),
    body("startAt").isISO8601(),
    body("reason").optional().isString().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { doctorId, patientProfileId, startAt, reason } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new AppError(404, "Doctor not found");
    const readiness = getDoctorBookingReadiness(doctor);
    if (!readiness.bookable) {
      throw new AppError(
        400,
        `Doctor profile incomplete for booking. Missing: ${readiness.missing.join(", ")}`
      );
    }

    const user = await User.findById(req.auth.id);
    if (!user) throw new AppError(404, "User not found");

    const patientProfile = user.patientProfiles.id(patientProfileId);
    if (!patientProfile) throw new AppError(404, "Patient profile not found");

    const requestedStart = new Date(startAt);
    if (requestedStart < new Date()) {
      throw new AppError(400, "Cannot book past slots");
    }

    const dateOnly = requestedStart.toISOString().slice(0, 10);
    const slots = await generateDoctorSlots(doctor, dateOnly);
    const slot = slots.find(
      (s) => s.startAt === requestedStart.toISOString() && s.isAvailable
    );
    if (!slot) {
      throw new AppError(409, "Selected slot is not available");
    }

    const appointment = await Appointment.create({
      doctorId: doctor._id,
      userId: user._id,
      patientProfileId,
      patientSnapshot: {
        name: patientProfile.name,
        age: patientProfile.age,
        gender: patientProfile.gender,
        relation: patientProfile.relation,
        contact: patientProfile.contact,
      },
      doctorSnapshot: {
        name: doctor.name,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee ?? null,
      },
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
      reason: reason || "General consultation",
      medicalHistorySnapshot: (
        await MedicalRecord.find({
          userId: user._id,
          patientProfileId,
        })
          .sort({ createdAt: -1 })
          .limit(30)
          .select("_id originalName mimeType notes size createdAt")
          .lean()
      ).map((record) => ({
        recordId: record._id,
        title: record.originalName || "Medical Record",
        type: record.mimeType?.startsWith("image/") ? "Imaging" : "Document",
        notes: record.notes || "",
        uploadedAt: record.createdAt,
        fileSizeKb: Math.max(1, Math.round((record.size || 0) / 1024)),
      })),
      status: "upcoming",
    });
    publishAppointmentEvent({
      type: "created",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });

    res.status(201).json({ success: true, data: appointment });
  })
);

router.get(
  "/",
  requireAuth,
  [query("status").optional().isIn(["pending", "upcoming", "completed", "cancelled", "rescheduled"])],
  validate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.auth.role === "user") {
      filter.userId = req.auth.id;
    } else if (req.auth.role === "doctor") {
      filter.doctorId = req.auth.id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

router.patch(
  "/:id/accept",
  requireAuth,
  requireRole("doctor"),
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.auth.id,
    });
    if (!appointment) throw new AppError(404, "Appointment not found");
    if (appointment.status !== "pending") {
      throw new AppError(400, "Only pending appointments can be accepted");
    }
    appointment.status = "upcoming";
    await appointment.save();
    publishAppointmentEvent({
      type: "accepted",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });
    res.json({ success: true, data: appointment });
  })
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("doctor"),
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.auth.id,
    });
    if (!appointment) throw new AppError(404, "Appointment not found");
    if (appointment.status !== "pending") {
      throw new AppError(400, "Only pending appointments can be rejected");
    }
    appointment.status = "cancelled";
    await appointment.save();
    publishAppointmentEvent({
      type: "rejected",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });
    res.json({ success: true, data: appointment });
  })
);

router.patch(
  "/:id/cancel",
  requireAuth,
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const filter = { _id: req.params.id };
    if (req.auth.role === "user") filter.userId = req.auth.id;
    if (req.auth.role === "doctor") filter.doctorId = req.auth.id;

    const appointment = await Appointment.findOne(filter);
    if (!appointment) throw new AppError(404, "Appointment not found");
    if (appointment.status === "completed") {
      throw new AppError(400, "Completed appointment cannot be cancelled");
    }
    appointment.status = "cancelled";
    await appointment.save();
    publishAppointmentEvent({
      type: "cancelled",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });
    res.json({ success: true, data: appointment });
  })
);

router.patch(
  "/:id/reschedule",
  requireAuth,
  requireRole("user"),
  [param("id").custom(isObjectId), body("startAt").isISO8601()],
  validate,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.auth.id,
    });
    if (!appointment) throw new AppError(404, "Appointment not found");
    if (appointment.status === "completed") {
      throw new AppError(400, "Completed appointment cannot be rescheduled");
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) throw new AppError(404, "Doctor not found");
    const readiness = getDoctorBookingReadiness(doctor);
    if (!readiness.bookable) {
      throw new AppError(
        400,
        `Doctor profile incomplete for booking. Missing: ${readiness.missing.join(", ")}`
      );
    }

    const newStart = new Date(req.body.startAt);
    if (newStart < new Date()) throw new AppError(400, "Cannot pick past slots");

    const dateOnly = newStart.toISOString().slice(0, 10);
    const slots = await generateDoctorSlots(doctor, dateOnly);
    const slot = slots.find((s) => s.startAt === newStart.toISOString() && s.isAvailable);
    if (!slot) {
      throw new AppError(409, "Selected reschedule slot is not available");
    }

    appointment.startAt = new Date(slot.startAt);
    appointment.endAt = new Date(slot.endAt);
    appointment.status = "upcoming";
    await appointment.save();
    publishAppointmentEvent({
      type: "rescheduled",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });
    res.json({ success: true, data: appointment });
  })
);

router.patch(
  "/:id/complete",
  requireAuth,
  requireRole("doctor"),
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.auth.id,
    });
    if (!appointment) throw new AppError(404, "Appointment not found");
    appointment.status = "completed";
    await appointment.save();
    publishAppointmentEvent({
      type: "completed",
      appointmentId: String(appointment._id),
      status: appointment.status,
      userId: String(appointment.userId),
      doctorId: String(appointment.doctorId),
    });
    res.json({ success: true, data: appointment });
  })
);

module.exports = router;

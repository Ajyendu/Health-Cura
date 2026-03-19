const express = require("express");
const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const Appointment = require("./appointment.model");
const User = require("../users/user.model");
const Doctor = require("../doctors/doctor.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const { getPagination } = require("../../common/utils/pagination");
const {
  requireAuth,
  requireRole,
} = require("../../common/middleware/auth");
const { generateDoctorSlots } = require("../doctors/slot.service");

const router = express.Router();

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

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
        consultationFee: doctor.consultationFee,
      },
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
      reason: reason || "General consultation",
      status: "upcoming",
    });

    res.status(201).json({ success: true, data: appointment });
  })
);

router.get(
  "/",
  requireAuth,
  [query("status").optional().isIn(["upcoming", "completed", "cancelled", "rescheduled"])],
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
    appointment.status = "rescheduled";
    await appointment.save();
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
    res.json({ success: true, data: appointment });
  })
);

module.exports = router;

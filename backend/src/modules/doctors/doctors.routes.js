const express = require("express");
const { param, query } = require("express-validator");
const mongoose = require("mongoose");
const Doctor = require("./doctor.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const { getPagination } = require("../../common/utils/pagination");
const { generateDoctorSlots } = require("./slot.service");

const router = express.Router();

const parseDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

router.get(
  "/",
  [
    query("lat").optional().isFloat(),
    query("lng").optional().isFloat(),
    query("radiusKm").optional().isFloat({ min: 0.1, max: 200 }),
    query("specialization").optional().isString(),
    query("search").optional().isString(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, "i");
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { specialization: new RegExp(req.query.search, "i") },
        { locationName: new RegExp(req.query.search, "i") },
      ];
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm || 10);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      };
    }

    const [items, total] = await Promise.all([
      Doctor.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

router.get(
  "/:id",
  [param("id").custom((value) => mongoose.Types.ObjectId.isValid(value))],
  validate,
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).select("-password").lean();
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }
    res.json({ success: true, data: doctor });
  })
);

router.get(
  "/:id/slots",
  [
    param("id").custom((value) => mongoose.Types.ObjectId.isValid(value)),
    query("date").isString().notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }

    const date = parseDateOnly(req.query.date);
    if (!date) {
      throw new AppError(400, "Invalid date format. Use YYYY-MM-DD");
    }

    const slots = await generateDoctorSlots(doctor, req.query.date);
    res.json({ success: true, data: slots });
  })
);

module.exports = router;

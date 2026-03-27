const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { param, query, body } = require("express-validator");
const mongoose = require("mongoose");
const Doctor = require("./doctor.model");
const Appointment = require("../appointments/appointment.model");
const User = require("../users/user.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const { getPagination } = require("../../common/utils/pagination");
const { generateDoctorSlots } = require("./slot.service");
const { getDoctorBookingReadiness } = require("./bookingReadiness");
const {
  requireAuth,
  requireRole,
} = require("../../common/middleware/auth");
const env = require("../../config/env");

const router = express.Router();

const doctorUploadsDir = path.resolve(env.RECORDS_UPLOAD_DIR, "doctors");
if (!fs.existsSync(doctorUploadsDir)) {
  fs.mkdirSync(doctorUploadsDir, { recursive: true });
}

const doctorPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, doctorUploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || ".jpg");
      const filename = `doctor-${req.auth?.id || "profile"}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      return cb(new AppError(400, "Photo must be jpeg/png/webp"));
    }
    cb(null, true);
  },
});

const parseDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const toRadians = (value) => (value * Math.PI) / 180;
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const isValidTime = (value) => /^\d{2}:\d{2}$/.test(String(value || ""));

router.get(
  "/me",
  requireAuth,
  requireRole("doctor"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.auth.id).select("-password").lean();
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }
    res.json({ success: true, data: doctor });
  })
);

router.patch(
  "/me",
  requireAuth,
  requireRole("doctor"),
  doctorPhotoUpload.single("photo"),
  [
    body("name").optional().isString().trim().notEmpty(),
    body("specialization").optional().isString().trim().notEmpty(),
    body("yearsExperience").optional().isInt({ min: 0, max: 80 }),
    body("consultationFee").optional().isFloat({ min: 0 }),
    body("bio").optional().isString(),
    body("qualifications").optional().isString(),
    body("licenseNumber").optional().isString(),
    body("contactPhone").optional().isString(),
    body("clinicAddress").optional().isString(),
    body("hospital").optional().isString(),
    body("locationName").optional().isString(),
    body("slotDurationMinutes").optional().isInt({ min: 5, max: 120 }),
    body("licenseIssuedAt").optional().isISO8601(),
    body("availabilityWeekly").optional().isString(),
    body("lat").optional().isFloat({ min: -90, max: 90 }),
    body("lng").optional().isFloat({ min: -180, max: 180 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.auth.id);
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }

    const updatableFields = [
      "name",
      "specialization",
      "bio",
      "qualifications",
      "licenseNumber",
      "contactPhone",
      "clinicAddress",
      "hospital",
      "locationName",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    if (req.body.yearsExperience !== undefined && doctor.verified) {
      doctor.yearsExperience = Number(req.body.yearsExperience);
    }
    if (req.body.licenseIssuedAt !== undefined) {
      doctor.licenseIssuedAt = req.body.licenseIssuedAt ? new Date(req.body.licenseIssuedAt) : null;
      if (doctor.verified && doctor.licenseIssuedAt) {
        const now = new Date();
        const issued = new Date(doctor.licenseIssuedAt);
        let years = now.getFullYear() - issued.getFullYear();
        const monthDiff = now.getMonth() - issued.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < issued.getDate())) {
          years -= 1;
        }
        doctor.yearsExperience = Math.max(0, years);
      } else {
        doctor.yearsExperience = null;
      }
    }
    if (req.body.consultationFee !== undefined) {
      doctor.consultationFee =
        req.body.consultationFee === "" ? null : Number(req.body.consultationFee);
    }
    if (req.body.slotDurationMinutes !== undefined) {
      doctor.slotDurationMinutes =
        req.body.slotDurationMinutes === ""
          ? null
          : Number(req.body.slotDurationMinutes);
    }
    if (req.body.languages !== undefined) {
      doctor.languages = String(req.body.languages)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (req.body.availabilityWeekly !== undefined) {
      let parsed = [];
      try {
        parsed = JSON.parse(String(req.body.availabilityWeekly || "[]"));
      } catch {
        throw new AppError(400, "Invalid availabilityWeekly JSON");
      }
      if (!Array.isArray(parsed)) {
        throw new AppError(400, "availabilityWeekly must be an array");
      }
      const normalized = parsed.map((slot) => ({
        dayOfWeek: Number(slot?.dayOfWeek),
        start: String(slot?.start || ""),
        end: String(slot?.end || ""),
        capacity: Number(slot?.capacity),
      }));
      for (const slot of normalized) {
        if (!Number.isInteger(slot.dayOfWeek) || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
          throw new AppError(400, "dayOfWeek must be between 0 and 6");
        }
        if (!isValidTime(slot.start) || !isValidTime(slot.end) || slot.start >= slot.end) {
          throw new AppError(400, "Each availability slot must have valid start/end times");
        }
        if (!Number.isInteger(slot.capacity) || slot.capacity < 1 || slot.capacity > 100) {
          throw new AppError(400, "Each slot capacity must be between 1 and 100");
        }
      }
      doctor.availabilityWeekly = normalized;
    }
    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      doctor.location = {
        type: "Point",
        coordinates: [Number(req.body.lng), Number(req.body.lat)],
      };
    }
    if (req.file) {
      doctor.photoUrl = `/uploads/doctors/${req.file.filename}`;
    }

    await doctor.save();
    const updated = await Doctor.findById(doctor._id).select("-password").lean();
    res.json({ success: true, data: updated });
  })
);

router.get(
  "/",
  [
    query("lat").optional().isFloat(),
    query("lng").optional().isFloat(),
    query("radiusKm").optional().isFloat({ min: 0.1, max: 200 }),
    query("specialization").optional().isString(),
    query("search").optional().isString(),
    query("date").optional().isString(),
    query("availableOnly").optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const baseFilter = {};

    if (req.query.specialization) {
      baseFilter.specialization = new RegExp(req.query.specialization, "i");
    }

    if (req.query.search) {
      baseFilter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { specialization: new RegExp(req.query.search, "i") },
        { locationName: new RegExp(req.query.search, "i") },
      ];
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm || 10);
    const availableOnly =
      req.query.availableOnly === true || req.query.availableOnly === "true";
    const dateForAvailability = req.query.date;

    let items = [];
    let total = 0;

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // Fallback-safe radius filtering in app layer avoids $near index/runtime issues.
      const allMatching = await Doctor.find(baseFilter).select("-password").lean();
      const nearby = allMatching
        .map((doctor) => {
          const dLat = doctor.location?.coordinates?.[1];
          const dLng = doctor.location?.coordinates?.[0];
          if (!Number.isFinite(dLat) || !Number.isFinite(dLng)) {
            return { ...doctor, distanceKm: null };
          }
          const km = distanceKm(lat, lng, dLat, dLng);
          return km <= radiusKm ? { ...doctor, distanceKm: km } : null;
        })
        .filter(Boolean)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });

      total = nearby.length;
      items = nearby.slice(skip, skip + limit).map((doctor) => ({
        ...doctor,
        bookingReadiness: getDoctorBookingReadiness(doctor),
      }));
    } else {
      [items, total] = await Promise.all([
        Doctor.find(baseFilter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Doctor.countDocuments(baseFilter),
      ]);
      items = items.map((doctor) => ({
        ...doctor,
        bookingReadiness: getDoctorBookingReadiness(doctor),
      }));
    }

    if (availableOnly && dateForAvailability) {
      const filtered = [];
      for (const doctor of items) {
        if (!doctor.bookingReadiness?.bookable) continue;
        const slots = await generateDoctorSlots(doctor, dateForAvailability);
        if (slots.some((slot) => slot.isAvailable)) {
          filtered.push(doctor);
        }
      }
      items = filtered;
      total = filtered.length;
    }

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
    res.json({
      success: true,
      data: {
        ...doctor,
        bookingReadiness: getDoctorBookingReadiness(doctor),
      },
    });
  })
);

router.post(
  "/:id/reviews",
  requireAuth,
  requireRole("user"),
  [
    param("id").custom((value) => mongoose.Types.ObjectId.isValid(value)),
    body("appointmentId").custom((value) => mongoose.Types.ObjectId.isValid(value)),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new AppError(404, "Doctor not found");

    const appointment = await Appointment.findOneAndUpdate({
      _id: req.body.appointmentId,
      userId: req.auth.id,
      doctorId: req.params.id,
      status: "completed",
      reviewSubmittedAt: null,
    }, {
      $set: { reviewSubmittedAt: new Date() },
    }, { new: true });
    if (!appointment) {
      throw new AppError(400, "Review already submitted or appointment not eligible");
    }

    const user = await User.findById(req.auth.id).lean();
    const reviewDoc = {
      userName: user?.name || "Patient",
      rating: Number(req.body.rating),
      comment: req.body.comment || "",
    };
    doctor.reviews.push(reviewDoc);
    doctor.ratingCount = doctor.reviews.length;
    doctor.ratingAverage =
      doctor.reviews.reduce((sum, review) => sum + review.rating, 0) /
      doctor.ratingCount;
    await doctor.save();

    res.status(201).json({
      success: true,
      data: {
        ratingAverage: doctor.ratingAverage,
        ratingCount: doctor.ratingCount,
      },
    });
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
    const readiness = getDoctorBookingReadiness(doctor);
    if (!readiness.bookable) {
      return res.json({ success: true, data: [], meta: { bookingReadiness: readiness } });
    }

    const slots = await generateDoctorSlots(doctor, req.query.date);
    res.json({ success: true, data: slots });
  })
);

module.exports = router;

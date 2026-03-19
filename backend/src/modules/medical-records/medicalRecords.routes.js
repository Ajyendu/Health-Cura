const express = require("express");
const fs = require("fs");
const path = require("path");
const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const MedicalRecord = require("./medicalRecord.model");
const User = require("../users/user.model");
const upload = require("./upload.middleware");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const { getPagination } = require("../../common/utils/pagination");
const {
  requireAuth,
  requireRole,
} = require("../../common/middleware/auth");

const router = express.Router();
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.post(
  "/upload",
  requireAuth,
  requireRole("user"),
  upload.single("file"),
  [
    body("patientProfileId").custom(isObjectId),
    body("appointmentId").optional().custom(isObjectId),
    body("notes").optional().isString(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "File is required");
    }

    const user = await User.findById(req.auth.id);
    if (!user) throw new AppError(404, "User not found");
    const patient = user.patientProfiles.id(req.body.patientProfileId);
    if (!patient) throw new AppError(404, "Patient profile not found");

    const record = await MedicalRecord.create({
      userId: req.auth.id,
      patientProfileId: req.body.patientProfileId,
      appointmentId: req.body.appointmentId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath: req.file.path,
      notes: req.body.notes || "",
      tags: req.body.tags
        ? String(req.body.tags)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
      uploadedByRole: req.auth.role,
    });

    res.status(201).json({ success: true, data: record });
  })
);

router.get(
  "/",
  requireAuth,
  requireRole("user"),
  [query("patientProfileId").optional().custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { userId: req.auth.id };
    if (req.query.patientProfileId) {
      filter.patientProfileId = req.query.patientProfileId;
    }

    const [items, total] = await Promise.all([
      MedicalRecord.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

router.get(
  "/:id/download",
  requireAuth,
  requireRole("user"),
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      userId: req.auth.id,
    }).lean();
    if (!record) throw new AppError(404, "Record not found");
    if (!fs.existsSync(record.filePath)) {
      throw new AppError(404, "File not available on server");
    }
    res.download(path.resolve(record.filePath), record.originalName);
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("user"),
  [param("id").custom(isObjectId)],
  validate,
  asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      userId: req.auth.id,
    });
    if (!record) throw new AppError(404, "Record not found");
    if (fs.existsSync(record.filePath)) {
      fs.unlinkSync(record.filePath);
    }
    await record.deleteOne();
    res.json({ success: true, message: "Record deleted" });
  })
);

module.exports = router;

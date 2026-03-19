const express = require("express");
const { body, param } = require("express-validator");
const mongoose = require("mongoose");
const User = require("./user.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const {
  requireAuth,
  requireRole,
} = require("../../common/middleware/auth");

const router = express.Router();

router.get(
  "/profile",
  requireAuth,
  requireRole("user"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.id).select("-password").lean();
    if (!user) {
      throw new AppError(404, "User not found");
    }
    res.json({ success: true, data: user });
  })
);

router.patch(
  "/profile",
  requireAuth,
  requireRole("user"),
  [
    body("name").optional().isString().trim().notEmpty(),
    body("age").optional().isInt({ min: 0, max: 120 }),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("contact").optional().isString().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.auth.id,
      { $set: req.body },
      { new: true }
    )
      .select("-password")
      .lean();
    if (!user) {
      throw new AppError(404, "User not found");
    }
    res.json({ success: true, data: user });
  })
);

router.post(
  "/patient-profiles",
  requireAuth,
  requireRole("user"),
  [
    body("name").isString().trim().notEmpty(),
    body("age").isInt({ min: 0, max: 120 }),
    body("gender").isIn(["male", "female", "other"]),
    body("relation").optional().isString().trim(),
    body("contact").optional().isString().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    user.patientProfiles.push(req.body);
    await user.save();
    const created = user.patientProfiles[user.patientProfiles.length - 1];
    res.status(201).json({ success: true, data: created });
  })
);

router.patch(
  "/patient-profiles/:id",
  requireAuth,
  requireRole("user"),
  [
    param("id").custom((value) => mongoose.Types.ObjectId.isValid(value)),
    body("name").optional().isString().trim().notEmpty(),
    body("age").optional().isInt({ min: 0, max: 120 }),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("relation").optional().isString().trim(),
    body("contact").optional().isString().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const patient = user.patientProfiles.id(req.params.id);
    if (!patient) {
      throw new AppError(404, "Patient profile not found");
    }

    Object.assign(patient, req.body);
    await user.save();
    res.json({ success: true, data: patient });
  })
);

router.delete(
  "/patient-profiles/:id",
  requireAuth,
  requireRole("user"),
  [param("id").custom((value) => mongoose.Types.ObjectId.isValid(value))],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const patient = user.patientProfiles.id(req.params.id);
    if (!patient) {
      throw new AppError(404, "Patient profile not found");
    }

    patient.deleteOne();
    await user.save();
    res.json({ success: true, message: "Patient profile deleted" });
  })
);

module.exports = router;

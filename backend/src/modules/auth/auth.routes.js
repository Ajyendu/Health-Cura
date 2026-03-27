const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const User = require("../users/user.model");
const Doctor = require("../doctors/doctor.model");
const validate = require("../../common/middleware/validate");
const asyncHandler = require("../../common/utils/asyncHandler");
const AppError = require("../../common/errors/AppError");
const {
  signToken,
  setRoleCookie,
  clearAuthCookies,
  requireAuth,
} = require("../../common/middleware/auth");

const router = express.Router();

const registerValidators = [
  body("name").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("specialization").optional().isString().trim().notEmpty(),
];

const loginValidators = [body("email").isEmail(), body("password").isString()];

const sanitizeAuthUser = (doc) => ({
  _id: doc._id,
  name: doc.name,
  email: doc.email,
  role: doc.role,
});

const registerFactory = (role) =>
  asyncHandler(async (req, res) => {
    const { name, email, password, specialization } = req.body;
    const Model = role === "doctor" ? Doctor : User;
    const existing = await Model.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError(409, `${role} with this email already exists`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Model.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role,
      ...(role === "user"
        ? {
            patientProfiles: [
              {
                name,
                age: 25,
                gender: "other",
                relation: "self",
              },
            ],
          }
        : {
            specialization: specialization || "",
          }),
    });

    const token = signToken({ id: created._id, role });
    setRoleCookie(res, role, token);
    res.status(201).json({ success: true, data: sanitizeAuthUser(created) });
  });

const loginFactory = (role) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const Model = role === "doctor" ? Doctor : User;
    const found = await Model.findOne({ email: email.toLowerCase() });
    if (!found) {
      throw new AppError(401, "Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, found.password);
    if (!isValid) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = signToken({ id: found._id, role });
    setRoleCookie(res, role, token);
    res.json({ success: true, data: sanitizeAuthUser(found) });
  });

router.post(
  "/register/user",
  registerValidators,
  validate,
  registerFactory("user")
);
router.post(
  "/register/doctor",
  registerValidators,
  validate,
  registerFactory("doctor")
);
router.post("/login/user", loginValidators, validate, loginFactory("user"));
router.post("/login/doctor", loginValidators, validate, loginFactory("doctor"));

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    clearAuthCookies(res);
    res.json({ success: true, message: "Logged out" });
  })
);

router.post(
  "/refresh",
  requireAuth,
  asyncHandler(async (req, res) => {
    const token = signToken({ id: req.auth.id, role: req.auth.role });
    setRoleCookie(res, req.auth.role, token);
    res.json({ success: true, data: { role: req.auth.role } });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const Model = req.auth.role === "doctor" ? Doctor : User;
    const profile = await Model.findById(req.auth.id).select("-password").lean();
    if (!profile) {
      throw new AppError(404, "Account not found");
    }
    res.json({ success: true, data: profile });
  })
);

module.exports = router;

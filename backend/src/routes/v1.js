const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const usersRoutes = require("../modules/users/users.routes");
const doctorsRoutes = require("../modules/doctors/doctors.routes");
const appointmentsRoutes = require("../modules/appointments/appointments.routes");
const medicalRecordsRoutes = require("../modules/medical-records/medicalRecords.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/records", medicalRecordsRoutes);

module.exports = router;

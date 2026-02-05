const express = require("express");
const router = express.Router();
const fetchdoctor = require("../middleware/fetchDoctor");
const fetchuser = require("../middleware/fetchUser");
const Appointment = require("../models/Appointment");

router.put("/:id/accept", fetchdoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctor.id, // 🔐 ownership check
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = "accepted";
    await appointment.save();

    res.json({ message: "Appointment accepted", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/reject", fetchdoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctor.id,
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = "rejected";
    await appointment.save();

    res.json({ message: "Appointment rejected", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/doctor", fetchdoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.doctor.id,
    }).populate("user", "name email");

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user", fetchuser, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.user.id,
    }).populate("doctor", "name email category");

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/request", fetchuser, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing" });
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      user: req.user.id,
      date,
      time,
      reason,
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment request sent",
      appointment,
    });
  } catch (err) {
    console.error("❌ Appointment request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

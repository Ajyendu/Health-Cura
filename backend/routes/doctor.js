const express = require("express");
const fetchdoctor = require("../middleware/fetchDoctor");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const DOCTOR = require("../models/doctor");

const JWT_SECRET = "ajjumon";

// Add OPTIONS handler for preflight requests

// doctor creation
router.post(
  "/createdoctor",
  [
    body("name", "Enter a name").isLength({ min: 1 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const email = req.body.email.toLowerCase();
      let doctor = await DOCTOR.findOne({ email });
      if (doctor) {
        return res
          .status(400)
          .json({ error: "Sorry a doctor of this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      const newdoctor = await DOCTOR.create({
        name: req.body.name,
        email,
        password: secPass,
        category: "doctor",
      });

      const data = {
        doctor: {
          id: newdoctor.id,
          name: newdoctor.name,
          email: newdoctor.email,
          category: newdoctor.category,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res
        .cookie("doctorToken", authtoken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 1000 * 60 * 60 * 24,
        })
        .status(201)
        .json({ message: "Doctor registered", doctor: newdoctor });
    } catch (err) {
      console.error("Error creating doctor:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// doctor login
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter password").exists(),
  ],
  async (req, res) => {
    try {
      const email = req.body.email.toLowerCase();
      const { password } = req.body;
      let doctor = await DOCTOR.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, doctor.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const data = {
        doctor: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          category: doctor.category,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res
        .cookie("doctorToken", authtoken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 1000 * 60 * 60 * 24,
        })
        .status(200)
        .json({ message: "Doctor login successful", doctor });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post("/getdoctor", fetchdoctor, async (req, res) => {
  console.log("➡️ /getdoctor hit");
  console.log("req.doctor:", req.doctor);
  console.log("req.doctor.id:", req.doctor?.id);

  try {
    if (!req.doctor || !req.doctor.id) {
      console.error("❌ No doctor ID in request");
      return res.status(401).json({ error: "Doctor ID not found in token" });
    }

    const doctorId = req.doctor.id;
    console.log("🔍 Looking for doctor with ID:", doctorId);

    const doctor = await DOCTOR.findById(doctorId).select("-password");

    if (!doctor) {
      console.error("❌ Doctor not found in database for ID:", doctorId);
      return res.status(404).json({ error: "Doctor not found" });
    }

    console.log("✅ Doctor found:", doctor);
    res.json(doctor);
  } catch (err) {
    console.error("❌ Error in getdoctor:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// doctor logout
router.post("/logout", async (req, res) => {
  res
    .clearCookie("doctorToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    })
    .json({ message: "Logged out successfully" });
});

router.get("/", async (req, res) => {
  try {
    const doctor = await DOCTOR.find({});
    res.json(doctor);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

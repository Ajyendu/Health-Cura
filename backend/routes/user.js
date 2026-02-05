const express = require("express");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const USER = require("../models/user");

const JWT_SECRET = "ajjumon";

// user creation
router.post(
  "/createuser",
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

      let user = await USER.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user of this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      const newuser = await USER.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: newuser.id,
          name: newuser.name,
          email: newuser.email,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res
        .cookie("userToken", authtoken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 1000 * 60 * 60 * 24,
        })
        .status(201)
        .json({ message: "User registered", user: newuser });
    } catch (err) {
      console.error("Error creating user:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// user login
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter password").exists(),
  ],
  async (req, res) => {
    try {
      const email = req.body.email.toLowerCase();
      const password = req.body.password;
      let user = await USER.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const data = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res
        .cookie("userToken", authtoken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 1000 * 60 * 60 * 24,
        })
        .status(200)
        .json({ message: "User login successful", user });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post("/getuser", fetchuser, async (req, res) => {
  console.log("➡️ /getuser hit");
  console.log("req.user:", req.user);
  console.log("req.user.id:", req.user?.id);

  try {
    if (!req.user || !req.user.id) {
      console.error("❌ No user ID in request");
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const userId = req.user.id;
    console.log("🔍 Looking for user with ID:", userId);

    const user = await USER.findById(userId).select("-password");

    if (!user) {
      console.error("❌ User not found in database for ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user);
    res.json(user);
  } catch (err) {
    console.error("❌ Error in getuser:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// user logout
router.post("/logout", async (req, res) => {
  res
    .clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    })
    .json({ message: "Logged out successfully" });
});

router.get("/", async (req, res) => {
  try {
    const user = await USER.find({});
    res.json(user);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

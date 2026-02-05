const jwt = require("jsonwebtoken");

const JWT_SECRET = "ajjumon";

const fetchdoctor = (req, res, next) => {
  const token = req.cookies.doctorToken;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Please authenticate using a valid token ..." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(
      "🔍 Decoded JWT token structure:",
      JSON.stringify(decoded, null, 2)
    );

    // DEBUG: Check what's actually in the token
    console.log("Token contains keys:", Object.keys(decoded));

    // Extract doctor ID - handle different possible structures
    let doctorId;

    if (decoded.doctor && decoded.doctor.id) {
      // Structure: { doctor: { id: "..." } }
      doctorId = decoded.doctor.id;
      console.log("✅ Extracted doctor ID from decoded.doctor.id:", doctorId);
    } else if (decoded.id) {
      // Structure: { id: "..." }
      doctorId = decoded.id;
      console.log("✅ Extracted doctor ID from decoded.id:", doctorId);
    } else if (decoded.doctorId) {
      // Structure: { doctorId: "..." }
      doctorId = decoded.doctorId;
      console.log("✅ Extracted doctor ID from decoded.doctorId:", doctorId);
    } else {
      // Unknown structure - log everything
      console.error("❌ Unknown token structure. Full decoded token:", decoded);
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Set the doctor ID in the request
    req.doctor = { id: doctorId };
    console.log("✅ Set req.doctor.id to:", req.doctor.id);

    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error);
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchdoctor;

const jwt = require("jsonwebtoken");

const JWT_SECRET = "ajjumon";

const fetchuser = (req, res, next) => {
  const token = req.cookies.userToken;

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

    // Extract user ID - handle different possible structures
    let userId;

    if (decoded.user && decoded.user.id) {
      // Structure: { user: { id: "..." } }
      userId = decoded.user.id;
      console.log("✅ Extracted user ID from decoded.user.id:", userId);
    } else if (decoded.id) {
      // Structure: { id: "..." }
      userId = decoded.id;
      console.log("✅ Extracted user ID from decoded.id:", userId);
    } else if (decoded.userId) {
      // Structure: { userId: "..." }
      userId = decoded.userId;
      console.log("✅ Extracted user ID from decoded.userId:", userId);
    } else {
      // Unknown structure - log everything
      console.error("❌ Unknown token structure. Full decoded token:", decoded);
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Set the user ID in the request
    req.user = { id: userId };
    console.log("✅ Set req.user.id to:", req.user.id);

    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error);
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;

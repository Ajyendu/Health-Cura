const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");
const env = require("../../config/env");

const extractToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.cookies.userToken || req.cookies.doctorToken || null;
};

const signToken = ({ id, role }) =>
  jwt.sign({ sub: id, role }, env.JWT_SECRET, { expiresIn: "7d" });

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setRoleCookie = (res, role, token) => {
  const cookieName = role === "doctor" ? "doctorToken" : "userToken";
  const clearName = role === "doctor" ? "userToken" : "doctorToken";
  res.clearCookie(clearName, cookieOptions());
  res.cookie(cookieName, token, cookieOptions());
};

const clearAuthCookies = (res) => {
  res.clearCookie("userToken", cookieOptions());
  res.clearCookie("doctorToken", cookieOptions());
};

const requireAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(new AppError(401, "Authentication required"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.auth = {
      id: decoded.sub,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    return next(new AppError(401, "Invalid or expired token"));
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return next(new AppError(401, "Authentication required"));
  }

  if (!allowedRoles.includes(req.auth.role)) {
    return next(new AppError(403, "Forbidden for this role"));
  }

  return next();
};

module.exports = {
  signToken,
  setRoleCookie,
  clearAuthCookies,
  requireAuth,
  requireRole,
};

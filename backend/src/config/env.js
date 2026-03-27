const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toNumber(process.env.PORT, 8005),
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare-app",
  JWT_SECRET: process.env.JWT_SECRET || "change_me_in_env",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  COOKIE_SECURE: process.env.NODE_ENV === "production",
  RECORDS_UPLOAD_DIR:
    process.env.RECORDS_UPLOAD_DIR || path.resolve(process.cwd(), "uploads"),
  MAX_UPLOAD_SIZE_BYTES: toNumber(
    process.env.MAX_UPLOAD_SIZE_BYTES,
    10 * 1024 * 1024
  ),
};

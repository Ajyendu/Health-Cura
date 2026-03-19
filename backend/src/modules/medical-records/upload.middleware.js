const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../../config/env");
const AppError = require("../../common/errors/AppError");

if (!fs.existsSync(env.RECORDS_UPLOAD_DIR)) {
  fs.mkdirSync(env.RECORDS_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.RECORDS_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const allowedMime = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new AppError(400, "Only PDF/JPEG/PNG/WEBP files are allowed"));
    }
    return cb(null, true);
  },
});

module.exports = upload;

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const env = require("./config/env");
const v1Routes = require("./routes/v1");
const errorHandler = require("./common/middleware/errorHandler");
const notFound = require("./common/middleware/notFound");

const app = express();

// Vite (and other reverse proxies) set X-Forwarded-For; rate-limit v8+ validates this.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Healthcare backend running" });
});

app.use("/uploads", express.static(path.resolve(env.RECORDS_UPLOAD_DIR)));
app.use("/api/v1", v1Routes);

// Legacy routes kept temporarily for backward compatibility.
app.use("/users", require("../routes/user"));
app.use("/doctor", require("../routes/doctor"));
app.use("/appointment", require("../routes/appointment"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

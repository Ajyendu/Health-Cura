const express = require("express");
const { connectToMongoDB } = require("./connect");
const userRoute = require("./routes/user");
const doctorRoute = require("./routes/doctor");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8005;
const cors = require("cors");
require("dotenv").config();

// CORS middleware should be first
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Then other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Connect to database
connectToMongoDB();

// Routes
app.use("/users", userRoute);
app.use("/doctor", doctorRoute);
app.use("/appointment", require("./routes/appointment"));

app.get("/", (req, res) => {
  res.send("Healthcare App Backend is Running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

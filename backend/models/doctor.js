const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  specialization: { type: String, default: "General Practitioner" },
  experience: { type: String, default: "5+ years" },
  location: { type: String, default: "India" },
  hospital: { type: String, default: "Associated Hospital" },
  availability: { type: String, default: "Mon-Fri, 9AM-5PM" },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 50 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", doctorSchema);

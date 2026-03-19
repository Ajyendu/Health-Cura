const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 120, default: 25 },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    relation: {
      type: String,
      default: "self",
      trim: true,
    },
    contact: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user"], default: "user" },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["male", "female", "other"] },
    contact: { type: String, default: "", trim: true },
    patientProfiles: { type: [patientProfileSchema], default: [] },
  },
  { timestamps: true, collection: "users" }
);

module.exports = mongoose.model("UserV1", userSchema);

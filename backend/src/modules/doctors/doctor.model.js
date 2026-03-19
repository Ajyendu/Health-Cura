const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userName: { type: String, trim: true, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
  },
  { _id: true, timestamps: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true }, // HH:mm
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["doctor"], default: "doctor" },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    specialization: {
      type: String,
      required: true,
      default: "General Physician",
      trim: true,
    },
    yearsExperience: { type: Number, min: 0, default: 1 },
    consultationFee: { type: Number, min: 0, default: 500 },
    hospital: { type: String, default: "", trim: true },
    locationName: { type: String, default: "", trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [77.5946, 12.9716], // lng, lat
      },
    },
    slotDurationMinutes: { type: Number, min: 5, max: 120, default: 30 },
    availabilityWeekly: {
      type: [availabilitySchema],
      default: [
        { dayOfWeek: 1, start: "09:00", end: "17:00" },
        { dayOfWeek: 2, start: "09:00", end: "17:00" },
        { dayOfWeek: 3, start: "09:00", end: "17:00" },
        { dayOfWeek: 4, start: "09:00", end: "17:00" },
        { dayOfWeek: 5, start: "09:00", end: "17:00" },
      ],
    },
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true, collection: "doctors" }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DoctorV1", doctorSchema);

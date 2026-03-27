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
    capacity: { type: Number, min: 1, max: 100, required: true },
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
      default: "",
      trim: true,
    },
    yearsExperience: { type: Number, min: 0, default: null },
    consultationFee: { type: Number, min: 0, default: null },
    licenseIssuedAt: { type: Date, default: null },
    bio: { type: String, default: "", trim: true },
    qualifications: { type: String, default: "", trim: true },
    licenseNumber: { type: String, default: "", trim: true },
    contactPhone: { type: String, default: "", trim: true },
    clinicAddress: { type: String, default: "", trim: true },
    languages: { type: [String], default: [] },
    photoUrl: { type: String, default: "" },
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
        default: undefined,
      },
    },
    slotDurationMinutes: { type: Number, min: 5, max: 120, default: null },
    availabilityWeekly: {
      type: [availabilitySchema],
      default: [],
    },
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "doctors" }
);

doctorSchema.pre("save", function computeExperienceFromLicense(next) {
  if (!this.verified || !this.licenseIssuedAt) {
    this.yearsExperience = null;
    return next();
  }
  const now = new Date();
  const issued = new Date(this.licenseIssuedAt);
  let years = now.getFullYear() - issued.getFullYear();
  const monthDiff = now.getMonth() - issued.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < issued.getDate())) {
    years -= 1;
  }
  this.yearsExperience = Math.max(0, years);
  next();
});

doctorSchema.index({ specialization: 1 });
doctorSchema.index(
  { location: "2dsphere" },
  { partialFilterExpression: { "location.coordinates.1": { $exists: true } } }
);

module.exports = mongoose.model("DoctorV1", doctorSchema);

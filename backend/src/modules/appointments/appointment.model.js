const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorV1",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserV1",
      required: true,
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    patientSnapshot: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true },
      relation: { type: String, default: "self" },
      contact: { type: String, default: "" },
    },
    doctorSnapshot: {
      name: { type: String, required: true },
      specialization: { type: String, required: true },
      consultationFee: { type: Number, required: true },
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    reason: { type: String, default: "General consultation", trim: true },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled", "rescheduled"],
      default: "upcoming",
    },
  },
  { timestamps: true, collection: "appointments" }
);

appointmentSchema.index({ doctorId: 1, startAt: 1 }, { unique: true });
appointmentSchema.index({ userId: 1, startAt: -1 });
appointmentSchema.index({ status: 1, startAt: -1 });

module.exports = mongoose.model("AppointmentV1", appointmentSchema);

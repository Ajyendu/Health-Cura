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
      consultationFee: { type: Number, default: null },
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    reason: { type: String, default: "General consultation", trim: true },
    medicalHistorySnapshot: {
      type: [
        {
          recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
          title: { type: String, required: true },
          type: { type: String, required: true },
          notes: { type: String, default: "" },
          uploadedAt: { type: Date, required: true },
          fileSizeKb: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "upcoming", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    reviewSubmittedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "appointments" }
);

appointmentSchema.index({ doctorId: 1, startAt: 1 }, { unique: true });
appointmentSchema.index({ userId: 1, startAt: -1 });
appointmentSchema.index({ status: 1, startAt: -1 });

module.exports = mongoose.model("AppointmentV1", appointmentSchema);

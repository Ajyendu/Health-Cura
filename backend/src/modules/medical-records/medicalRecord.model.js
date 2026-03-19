const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserV1",
      required: true,
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppointmentV1",
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    notes: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    uploadedByRole: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
    },
  },
  { timestamps: true, collection: "medicalrecords" }
);

medicalRecordSchema.index({ userId: 1, patientProfileId: 1, createdAt: -1 });

module.exports = mongoose.model("MedicalRecordV1", medicalRecordSchema);

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const uploadDir = path.resolve(__dirname, ".tmp_uploads");
process.env.RECORDS_UPLOAD_DIR = uploadDir;
process.env.JWT_SECRET = "test_jwt_secret";

const app = require("../src/app");
const Doctor = require("../src/modules/doctors/doctor.model");

let mongoServer;

const futureDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setHours(0, 0, 0, 0);
  return d;
};

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "healthcare-test" });
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
});

test("prevents double booking for same doctor slot", async () => {
  const userAgent = request.agent(app);
  const user2Agent = request.agent(app);
  const doctorAgent = request.agent(app);

  const userEmail = `user-${Date.now()}@test.com`;
  const user2Email = `user2-${Date.now()}@test.com`;
  const doctorEmail = `doctor-${Date.now()}@test.com`;

  await userAgent.post("/api/v1/auth/register/user").send({
    name: "User One",
    email: userEmail,
    password: "Password123",
  });

  await user2Agent.post("/api/v1/auth/register/user").send({
    name: "User Two",
    email: user2Email,
    password: "Password123",
  });

  await doctorAgent.post("/api/v1/auth/register/doctor").send({
    name: "Doctor One",
    email: doctorEmail,
    password: "Password123",
  });

  const doctor = await Doctor.findOne({ email: doctorEmail });
  const date = futureDay();
  await Doctor.updateOne(
    { _id: doctor._id },
    {
      $set: {
        availabilityWeekly: [
          { dayOfWeek: 0, start: "09:00", end: "11:00" },
          { dayOfWeek: 1, start: "09:00", end: "11:00" },
          { dayOfWeek: 2, start: "09:00", end: "11:00" },
          { dayOfWeek: 3, start: "09:00", end: "11:00" },
          { dayOfWeek: 4, start: "09:00", end: "11:00" },
          { dayOfWeek: 5, start: "09:00", end: "11:00" },
          { dayOfWeek: 6, start: "09:00", end: "11:00" },
        ],
        slotDurationMinutes: 30,
      },
    }
  );

  const doctorId = String(doctor._id);

  const slotsRes = await userAgent
    .get(`/api/v1/doctors/${doctorId}/slots`)
    .query({ date: date.toISOString().slice(0, 10) });
  assert.equal(slotsRes.status, 200);
  const firstSlot = slotsRes.body.data.find((slot) => slot.isAvailable);
  assert.ok(firstSlot);

  const profileRes1 = await userAgent.get("/api/v1/users/profile");
  const patient1 = profileRes1.body.data.patientProfiles[0];
  assert.ok(patient1?._id);

  const profileRes2 = await user2Agent.get("/api/v1/users/profile");
  const patient2 = profileRes2.body.data.patientProfiles[0];
  assert.ok(patient2?._id);

  const firstBooking = await userAgent.post("/api/v1/appointments").send({
    doctorId,
    patientProfileId: patient1._id,
    startAt: firstSlot.startAt,
    reason: "Slot conflict test",
  });
  assert.equal(firstBooking.status, 201);

  const secondBooking = await user2Agent.post("/api/v1/appointments").send({
    doctorId,
    patientProfileId: patient2._id,
    startAt: firstSlot.startAt,
    reason: "Attempt duplicate slot",
  });
  assert.equal(secondBooking.status, 409);
});

test("restricts medical record access to owner account", async () => {
  const ownerAgent = request.agent(app);
  const strangerAgent = request.agent(app);

  const ownerEmail = `owner-${Date.now()}@test.com`;
  const strangerEmail = `stranger-${Date.now()}@test.com`;

  await ownerAgent.post("/api/v1/auth/register/user").send({
    name: "Owner",
    email: ownerEmail,
    password: "Password123",
  });

  await strangerAgent.post("/api/v1/auth/register/user").send({
    name: "Stranger",
    email: strangerEmail,
    password: "Password123",
  });

  const ownerProfile = await ownerAgent.get("/api/v1/users/profile");
  const patient = ownerProfile.body.data.patientProfiles[0];
  assert.ok(patient?._id);

  const upload = await ownerAgent
    .post("/api/v1/records/upload")
    .field("patientProfileId", patient._id)
    .field("notes", "Blood report")
    .attach("file", Buffer.from("fake pdf content"), {
      filename: "report.pdf",
      contentType: "application/pdf",
    });
  assert.equal(upload.status, 201);
  const recordId = upload.body.data._id;

  const strangerDownload = await strangerAgent.get(
    `/api/v1/records/${recordId}/download`
  );
  assert.equal(strangerDownload.status, 404);

  const strangerDelete = await strangerAgent.delete(`/api/v1/records/${recordId}`);
  assert.equal(strangerDelete.status, 404);
});

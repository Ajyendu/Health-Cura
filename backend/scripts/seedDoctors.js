const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Doctor = require("../src/modules/doctors/doctor.model");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare-app";

const demoDoctors = [
  {
    name: "Dr. Aisha Kapoor",
    email: "aisha.kapoor@trial.health",
    specialization: "Cardiologist",
    yearsExperience: 12,
    consultationFee: 1200,
    bio: "Experienced cardiologist focused on preventive heart care and long-term lifestyle management.",
    qualifications: "MBBS, MD (Medicine), DM (Cardiology)",
    licenseNumber: "MCI-CARD-1021",
    contactPhone: "+91-9001001001",
    clinicAddress: "12 Residency Road, Bengaluru",
    hospital: "City Heart Institute",
    locationName: "Bengaluru",
    languages: ["English", "Hindi", "Kannada"],
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
  },
  {
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@trial.health",
    specialization: "Dermatologist",
    yearsExperience: 9,
    consultationFee: 900,
    bio: "Dermatologist helping patients with acne, eczema, fungal infections, and cosmetic skin concerns.",
    qualifications: "MBBS, MD (Dermatology)",
    licenseNumber: "MCI-DERM-2240",
    contactPhone: "+91-9001001002",
    clinicAddress: "45 Marine Drive, Mumbai",
    hospital: "Glow Skin Clinic",
    locationName: "Mumbai",
    languages: ["English", "Hindi", "Marathi"],
    location: { type: "Point", coordinates: [72.8777, 19.076] },
  },
  {
    name: "Dr. Neha Iyer",
    email: "neha.iyer@trial.health",
    specialization: "Pediatrician",
    yearsExperience: 15,
    consultationFee: 1000,
    bio: "Pediatric specialist for child development, vaccination support, and nutrition guidance.",
    qualifications: "MBBS, DCH, MD (Pediatrics)",
    licenseNumber: "MCI-PED-3341",
    contactPhone: "+91-9001001003",
    clinicAddress: "8 Boat Club Road, Pune",
    hospital: "Happy Kids Center",
    locationName: "Pune",
    languages: ["English", "Hindi", "Tamil"],
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
  },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  try {
    for (const doctor of demoDoctors) {
      const hashed = await bcrypt.hash("Password123", 10);
      await Doctor.updateOne(
        { email: doctor.email.toLowerCase() },
        {
          $set: {
            role: "doctor",
            ...doctor,
            email: doctor.email.toLowerCase(),
            password: hashed,
            ratingAverage: 4.5,
            ratingCount: 24,
            reviews: [
              {
                userName: "Trial User",
                rating: 5,
                comment: "Very helpful consultation.",
              },
            ],
          },
        },
        { upsert: true }
      );
    }
    console.log("Seeded demo doctors successfully.");
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Failed to seed doctors:", error);
  process.exit(1);
});

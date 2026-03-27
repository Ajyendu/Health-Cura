const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Doctor = require("../src/modules/doctors/doctor.model");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare-app";

// Center based on your current location request.
const center = { lat: 28.951004, lng: 77.067191 };

const buildNearbyDoctors = () => [
  {
    name: "Dr. Meera Sharma",
    email: "meera.sharma.nearby@trial.health",
    specialization: "General Physician",
    yearsExperience: 11,
    consultationFee: 700,
    locationName: "Nearby Sector 1",
    lat: center.lat + 0.008,
    lng: center.lng + 0.006,
  },
  {
    name: "Dr. Arjun Verma",
    email: "arjun.verma.nearby@trial.health",
    specialization: "Cardiologist",
    yearsExperience: 14,
    consultationFee: 1200,
    locationName: "Nearby Sector 2",
    lat: center.lat - 0.01,
    lng: center.lng + 0.005,
  },
  {
    name: "Dr. Nidhi Bansal",
    email: "nidhi.bansal.nearby@trial.health",
    specialization: "Dermatologist",
    yearsExperience: 8,
    consultationFee: 900,
    locationName: "Nearby Sector 3",
    lat: center.lat + 0.004,
    lng: center.lng - 0.009,
  },
  {
    name: "Dr. Kabir Anand",
    email: "kabir.anand.nearby@trial.health",
    specialization: "Pediatrician",
    yearsExperience: 10,
    consultationFee: 850,
    locationName: "Nearby Sector 4",
    lat: center.lat - 0.007,
    lng: center.lng - 0.004,
  },
  {
    name: "Dr. Riya Malhotra",
    email: "riya.malhotra.nearby@trial.health",
    specialization: "Orthopedic",
    yearsExperience: 13,
    consultationFee: 1100,
    locationName: "Nearby Sector 5",
    lat: center.lat + 0.012,
    lng: center.lng - 0.001,
  },
  {
    name: "Dr. Tanishq Suri",
    email: "tanishq.suri.nearby@trial.health",
    specialization: "ENT Specialist",
    yearsExperience: 7,
    consultationFee: 750,
    locationName: "Nearby Sector 6",
    lat: center.lat - 0.003,
    lng: center.lng + 0.011,
  },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  try {
    const hashedPassword = await bcrypt.hash("Password123", 10);
    const nearbyDoctors = buildNearbyDoctors();

    for (const doctor of nearbyDoctors) {
      await Doctor.updateOne(
        { email: doctor.email.toLowerCase() },
        {
          $set: {
            role: "doctor",
            name: doctor.name,
            email: doctor.email.toLowerCase(),
            password: hashedPassword,
            specialization: doctor.specialization,
            yearsExperience: doctor.yearsExperience,
            consultationFee: doctor.consultationFee,
            bio: `Experienced ${doctor.specialization.toLowerCase()} serving nearby patients with personalized care.`,
            qualifications: "MBBS, MD",
            licenseNumber: `NEARBY-${doctor.name.replace(/\s+/g, "-").toUpperCase()}`,
            contactPhone: "+91-9000000000",
            clinicAddress: `${doctor.locationName}, Local Area`,
            hospital: "Nearby Care Hospital",
            locationName: doctor.locationName,
            languages: ["English", "Hindi"],
            location: { type: "Point", coordinates: [doctor.lng, doctor.lat] },
            ratingAverage: 4.4,
            ratingCount: 18,
            reviews: [
              {
                userName: "Local Trial User",
                rating: 5,
                comment: "Very good nearby consultation experience.",
              },
            ],
          },
        },
        { upsert: true }
      );
    }
    console.log("Seeded nearby demo doctors successfully.");
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Failed to seed nearby doctors:", error);
  process.exit(1);
});

const mongoose = require("mongoose");

async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/healthcare-app"); // tells mongoose to connect to this database
    console.log("MongoDB connected!"); // await means first do this(promise) then do anything(next)
  } catch (err) {
    // await means to pause the further execution until this promise is resolved
    console.error("MongoDB connection error:", err);
  }
}

module.exports = { connectToMongoDB };

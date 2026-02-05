const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true, // every email should be unique otherwise server will give error
  },
  password: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: { type: String, required: false },
});

module.exports = mongoose.model("User", userSchema);

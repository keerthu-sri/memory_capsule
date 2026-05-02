const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  registerNumber: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  year: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  project: { type: String, required: true, trim: true },
  hobbies: { type: String, default: "", trim: true },
  certificates: { type: String, default: "", trim: true },
  internship: { type: String, default: "", trim: true },
  aim: { type: String, default: "", trim: true },
  profilePicture: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Member", memberSchema);

const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  text: { type: String, required: true },
  images: [String],
  mood: String,
  unlockDate: Date,
  isLocked: { type: Boolean, default: false },
  visibility: { type: String, enum: ["private", "public"], default: "private" },
}, { timestamps: true });

module.exports = mongoose.model("Memory", memorySchema);
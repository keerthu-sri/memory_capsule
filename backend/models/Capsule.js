const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  images: [String],
  mood: String,
  unlockDate: Date,
  isUnlocked: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: true },
  members: {
    type: [
      {
        email: { type: String, required: true },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
      }
    ],
    default: []
  },
  memories: {
    type: [
      {
        type: { type: String, enum: ["photo", "text", "audio"], required: true },
        content: { type: String, default: "" },
        preview: { type: String, default: "" },
      },
    ],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Capsule", capsuleSchema);
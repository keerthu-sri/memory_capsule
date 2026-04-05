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
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["viewer", "editor"], required: true },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "accepted",
      },
    },
  ],
  invites: [
    {
      email: { type: String, required: true },
      role: { type: String, enum: ["viewer", "editor"], required: true },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isCollaborative: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  memories: {
    type: [
      {
        type: { type: String, enum: ["photo", "text", "audio"], required: true },
        content: { type: String, default: "" },
        preview: { type: String, default: "" },
        mediaKind: { type: String, enum: ["voice", "song"], default: "voice" },
      },
    ],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Capsule", capsuleSchema);

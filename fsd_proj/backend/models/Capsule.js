const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  images: [String],
  mood: String,
  unlockDate: Date,
  isUnlocked: { type: Boolean, default: false },
  visibility: {
  type: String,
  enum: ["private", "public"],
  default: "private",
},
  collaborators: { type: [String], default: [] },
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
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: { type: String, default: "" },
  age: { type: Number, default: null },
  gender: { type: String, default: "" },
  avatar: { type: String, default: "" },
  hobbies: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);

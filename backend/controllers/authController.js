const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const fileToDataUri = (file) => {
  if (!file?.buffer) return "";
  const mimeType = file.mimetype || "application/octet-stream";
  return `data:${mimeType};base64,${file.buffer.toString("base64")}`;
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (error) {
      // Fall back to comma-separated parsing.
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
    },
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

exports.updateMe = async (req, res) => {
  const { name, email, phone, age, gender, hobbies, interests } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) {
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (phone !== undefined) user.phone = String(phone).trim();
    if (gender !== undefined) user.gender = String(gender).trim();
    if (age !== undefined) {
      const parsedAge = Number(age);
      user.age = Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : null;
    }

    if (hobbies !== undefined) user.hobbies = normalizeList(hobbies);
    if (interests !== undefined) user.interests = normalizeList(interests);
    if (req.file) user.avatar = fileToDataUri(req.file);

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      age: user.age,
      gender: user.gender || "",
      avatar: user.avatar || "",
      hobbies: user.hobbies || [],
      interests: user.interests || [],
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

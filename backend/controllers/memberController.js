const Member = require("../models/Member");

const requiredFields = ["name", "email", "registerNumber", "role", "year", "degree", "project"];

const normalizeMemberPayload = (body) => ({
  name: body.name,
  email: body.email,
  registerNumber: body.registerNumber,
  role: body.role,
  year: body.year,
  degree: body.degree,
  project: body.project,
  hobbies: body.hobbies || "",
  certificates: body.certificates || "",
  internship: body.internship || "",
  aim: body.aim || "",
});

const hasMissingRequiredFields = (body) =>
  requiredFields.some((field) => !String(body[field] || "").trim());

const getUploadedPath = (file) => `uploads/${file.filename}`;

exports.createMember = async (req, res) => {
  try {
    if (hasMissingRequiredFields(req.body)) {
      return res.status(400).json({ message: "Please fill all required member fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const member = await Member.create({
      ...normalizeMemberPayload(req.body),
      profilePicture: getUploadedPath(req.file),
    });

    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating member" });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching members" });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching member" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    if (hasMissingRequiredFields(req.body)) {
      return res.status(400).json({ message: "Please fill all required member fields" });
    }

    const updates = normalizeMemberPayload(req.body);

    if (req.file) {
      updates.profilePicture = getUploadedPath(req.file);
    }

    const member = await Member.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating member" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting member" });
  }
};

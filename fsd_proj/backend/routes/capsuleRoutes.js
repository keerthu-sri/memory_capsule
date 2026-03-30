const express = require("express");
const router = express.Router();
const protect = require("../middleware/authmiddleware");

const multer = require("multer");

// 🔥 MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const {
  createCapsule,
  getCapsules,
  inviteCollaborator,
} = require("../controllers/capsuleController");

// ✅ Create capsule (WITH IMAGE UPLOAD)
router.post("/", protect, upload.single("image"), createCapsule);

// Get all capsules
router.get("/", protect, getCapsules);

// Invite collaborator
router.post("/:id/invite", protect, inviteCollaborator);

module.exports = router;
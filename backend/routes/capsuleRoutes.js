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
  acceptInvite,
  rejectInvite
} = require("../controllers/capsuleController");

// ✅ Create capsule (WITH MEDIA UPLOADS)
router.post("/", protect, upload.fields([{ name: "image", maxCount: 10 }, { name: "audio", maxCount: 1 }]), createCapsule);

// Get all capsules
router.get("/", protect, getCapsules);

// Invite collaborator
router.post("/:id/invite", protect, inviteCollaborator);

// Accept/Reject invites (No Auth needed since it's an email link)
router.get("/:id/invite/accept", acceptInvite);
router.get("/:id/invite/reject", rejectInvite);

module.exports = router;
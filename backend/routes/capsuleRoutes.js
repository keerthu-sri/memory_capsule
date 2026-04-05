const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");

const multer = require("multer");

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, "uploads/"),
filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

const {
createCapsule,
getCapsules,
getCapsuleById,
inviteCollaborator,
getMyInvites,
acceptInvite,
rejectInvite,
addCapsuleMemories,
lockCapsule
} = require("../controllers/capsuleController");

// CREATE
router.post("/", protect, upload.any(), createCapsule);

// GET
router.get("/", protect, getCapsules);
router.get("/:id", protect, getCapsuleById);

// INVITE
router.post("/:id/invite", protect, inviteCollaborator);

// INVITES PANEL
router.get("/invites/me", protect, getMyInvites);

// ACCEPT / REJECT
router.post("/:id/invite/accept", protect, acceptInvite);
router.post("/:id/invite/reject", protect, rejectInvite);

// EDIT MEMORIES
router.post("/:id/memories", protect, upload.any(), addCapsuleMemories);

// LOCK
router.post("/:id/lock", protect, lockCapsule);

module.exports = router;

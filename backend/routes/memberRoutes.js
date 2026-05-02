const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  createMember,
  deleteMember,
  getMemberById,
  getMembers,
  updateMember,
} = require("../controllers/memberController");

const router = express.Router();
const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }

    cb(null, true);
  },
});

const uploadProfilePicture = (req, res, next) => {
  upload.single("profilePicture")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const message = error instanceof multer.MulterError ? error.message : error.message || "Upload failed";
    res.status(400).json({ message });
  });
};

router.post("/", uploadProfilePicture, createMember);
router.get("/", getMembers);
router.get("/:id", getMemberById);
router.put("/:id", uploadProfilePicture, updateMember);
router.delete("/:id", deleteMember);

module.exports = router;

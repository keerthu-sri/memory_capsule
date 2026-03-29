const express = require("express");
const router = express.Router();
const protect = require("../middleware/authmiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const { createMemory, getMemories } = require("../controllers/memoryController");

router.post("/", protect, upload.single("image"), createMemory);
router.get("/", protect, getMemories);

module.exports = router;
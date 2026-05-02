const express = require("express");
const router = express.Router();
const multer = require("multer");
const { register, login, getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/authmiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);
router.put("/me", protect, upload.single("avatar"), updateMe);

module.exports = router;

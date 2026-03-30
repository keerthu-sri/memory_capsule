const express = require("express");
const router = express.Router();
const protect = require("../middleware/authmiddleware");
const { createMemory, getMemories } = require("../controllers/memoryController");

router.post("/", protect, createMemory);
router.get("/", protect, getMemories);

module.exports = router;
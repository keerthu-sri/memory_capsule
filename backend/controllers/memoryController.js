const Memory = require("../models/Memory");

exports.createMemory = async (req, res) => {
  try {
    const memory = await Memory.create({
      ...req.body,
      userId: req.user.id,
      images: req.file ? [req.file.path] : [],
    });
    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: "Error creating memory" });
  }
};

exports.getMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // Hide text and images for locked memories
    const sanitizedMemories = memories.map(m => {
      const memoryObj = m.toObject();
      if (memoryObj.isLocked) {
        memoryObj.text = "Locked Memory";
        memoryObj.images = [];
      }
      return memoryObj;
    });

    res.json(sanitizedMemories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching memories" });
  }
};
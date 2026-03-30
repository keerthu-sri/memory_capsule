const Memory = require("../models/Memory");

exports.createMemory = async (req, res) => {
  const memory = await Memory.create({
    ...req.body,
    userId: req.user.id,
  });

  res.json(memory);
};

exports.getMemories = async (req, res) => {
  const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(memories);
};
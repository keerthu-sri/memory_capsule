const Capsule = require("../models/Capsule");
const nodemailer = require("nodemailer");

exports.createCapsule = async (req, res) => {
  try {
    const { title, message, unlockDate, mood, visibility, collaborators } = req.body;

    // 🔥 Get uploaded image path from multer
    const imagePath = req.file ? req.file.path : null;

    const capsule = await Capsule.create({
      title,
      message,
      unlockDate,
      mood,
      visibility,
      collaborators: collaborators || [],
      userId: req.user.id,
      // ✅ store image
      images: imagePath ? [imagePath] : [],
    });

    res.json(capsule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating capsule" });
  }
};

exports.getCapsules = async (req, res) => {
  const capsules = await Capsule.find({ userId: req.user.id }).sort({ unlockDate: 1, createdAt: -1 });
  res.json(capsules);
};

exports.inviteCollaborator = async (req, res) => {
  const { email } = req.body;
  const capsuleId = req.params.id;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Valid collaborator email is required" });
  }

  const capsule = await Capsule.findOne({ _id: capsuleId, userId: req.user.id });
  if (!capsule) {
    return res.status(404).json({ message: "Capsule not found" });
  }

  if (capsule.collaborators.includes(email)) {
    return res.status(200).json({ message: "Collaborator already invited", deliveryStatus: "already_invited" });
  }

  capsule.collaborators.push(email);
  capsule.isPrivate = false;
  await capsule.save();

  let deliveryStatus = "saved";

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Invitation to collaborate on "${capsule.title}"`,
        text: `You were invited to collaborate on the memory capsule "${capsule.title}".`,
      });
      deliveryStatus = "sent";
    } catch (error) {
      deliveryStatus = "saved_email_failed";
    }
  }

  return res.status(200).json({
    message: "Invitation processed",
    deliveryStatus,
    capsule,
  });
};
const Capsule = require("../models/Capsule");
const User = require("../models/User");
const nodemailer = require("nodemailer");

exports.createCapsule = async (req, res) => {
  try {
    const { title, message, unlockDate, mood, isPrivate, members, textMemories } = req.body;

    const images = req.files && req.files["image"] ? req.files["image"].map((f) => f.path) : [];
    const audioPath = req.files && req.files["audio"] ? req.files["audio"][0].path : null;

    let parsedMembers = [];
    if (members) {
      try {
        parsedMembers = JSON.parse(members);
      } catch (e) {
        console.error("Failed to parse members", e);
      }
    }

    let parsedTextMemories = [];
    if (textMemories) {
      try {
        parsedTextMemories = JSON.parse(textMemories);
      } catch (e) {
        console.error("Failed to parse text memories", e);
      }
    }

    const memoriesArray = [];
    
    images.forEach(img => {
      memoriesArray.push({ type: "photo", preview: `http://localhost:5000/${img.replace(/\\/g, '/')}` });
    });

    if (audioPath) {
      memoriesArray.push({ type: "audio", preview: `http://localhost:5000/${audioPath.replace(/\\/g, '/')}` });
    }

    parsedTextMemories.forEach(txt => {
      memoriesArray.push({ type: "text", content: txt });
    });

    const capsule = await Capsule.create({
      title,
      message,
      unlockDate,
      mood,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      members: parsedMembers,
      userId: req.user.id,
      images: images,
      memories: memoriesArray
    });

    res.json(capsule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating capsule" });
  }
};

exports.getCapsules = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const capsules = await Capsule.find({
      $or: [
        { userId: req.user.id },
        { "members.email": user.email, "members.status": { $ne: "rejected" } }
      ]
    }).sort({ unlockDate: 1, createdAt: -1 });
    
    const now = new Date();
    const sanitizedCapsules = capsules.map(c => {
      const capObj = c.toObject();
      const isUnlockedTemp = new Date(capObj.unlockDate) <= now || capObj.isUnlocked;
      
      if (!isUnlockedTemp) {
        capObj.message = "This capsule is locked.";
        capObj.images = [];
        capObj.memories = [];
      }
      return capObj;
    });

    res.json(sanitizedCapsules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching capsules" });
  }
};

exports.inviteCollaborator = async (req, res) => {
  const { email, role } = req.body;
  const capsuleId = req.params.id;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Valid collaborator email is required" });
  }

  const capsule = await Capsule.findOne({ _id: capsuleId, userId: req.user.id });
  if (!capsule) {
    return res.status(404).json({ message: "Capsule not found or unauthorized" });
  }

  const existingMember = capsule.members.find(m => m.email === email);
  if (existingMember) {
    return res.status(200).json({ message: "Collaborator already invited", deliveryStatus: "already_invited" });
  }

  capsule.members.push({ email, role: role || "viewer", status: "pending" });
  capsule.isPrivate = false;
  await capsule.save();

  const user = await User.findById(req.user.id);
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

      const acceptUrl = `http://localhost:5000/api/capsules/${capsuleId}/invite/accept?email=${encodeURIComponent(email)}`;
      const rejectUrl = `http://localhost:5000/api/capsules/${capsuleId}/invite/reject?email=${encodeURIComponent(email)}`;

      const inviteMessage = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #7919e6;">${user.name || 'A friend'} has invited you to a Digital Memory Capsule!</h2>
          <p><strong>Capsule Name:</strong> ${capsule.title}</p>
          <p><strong>Access Level:</strong> ${role || "viewer"}</p>
          <br/>
          <a href="${acceptUrl}" style="padding:10px 20px; background:#7919e6; color:white; text-decoration:none; border-radius:5px; margin-right:10px; font-weight:bold;">Accept Invite</a>
          <a href="${rejectUrl}" style="padding:10px 20px; background:#ef4444; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Reject</a>
          <br/><br/>
          <p style="color: #666;"><small>Log in to your sanctuary to view this capsule when it unlocks on ${new Date(capsule.unlockDate).toLocaleDateString()}.</small></p>
        </div>
      `;

      await transporter.sendMail({
        from: `"${user.name || 'Memory Capsule'} (via Capsule)" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        replyTo: user.email,
        to: email,
        subject: `Invitation to collaborate on "${capsule.title}"`,
        html: inviteMessage,
      });
      deliveryStatus = "sent";
    } catch (error) {
      console.error(error);
      deliveryStatus = "saved_email_failed";
    }
  }

  return res.status(200).json({
    message: "Invitation processed",
    deliveryStatus,
    capsule,
  });
};

exports.acceptInvite = async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  try {
    const capsule = await Capsule.findById(id);
    if (!capsule) return res.status(404).send("Capsule not found");

    const member = capsule.members.find(m => m.email === email);
    if (member) {
      member.status = "accepted";
      await capsule.save();
    }
    res.redirect("http://localhost:5173/shared");
  } catch(e) {
    res.status(500).send("Error validating invite");
  }
};

exports.rejectInvite = async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  try {
    const capsule = await Capsule.findById(id);
    if (!capsule) return res.status(404).send("Capsule not found");

    const member = capsule.members.find(m => m.email === email);
    if (member) {
      member.status = "rejected";
      await capsule.save();
    }
    res.redirect("http://localhost:5173/dashboard");
  } catch(e) {
    res.status(500).send("Error resolving invite");
  }
};
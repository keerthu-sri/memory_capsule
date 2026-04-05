const nodemailer = require("nodemailer");
const Capsule = require("../models/Capsule");
const User = require("../models/User");

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const getUserRole = (capsule, userId) => {
  if (capsule.userId?._id) {
    if (capsule.userId._id.toString() === userId) return "owner";
  } else if (capsule.userId?.toString() === userId) {
    return "owner";
  }

  const member = (capsule.members || []).find(
    (entry) => entry.user?.toString?.() === userId || entry.user?._id?.toString?.() === userId
  );

  return member?.status === "accepted" ? member.role : null;
};

const isUnlockedForView = (capsule) =>
  capsule.isUnlocked || (capsule.unlockDate ? new Date(capsule.unlockDate) <= new Date() : false);

const canEditCapsule = (capsule, role) =>
  capsule.isCollaborative && !capsule.isLocked && (role === "owner" || role === "editor");

const formatCapsuleForUser = (capsuleDoc, userId) => {
  const capsule = capsuleDoc.toObject({ virtuals: false });
  const role = getUserRole(capsuleDoc, userId);
  const unlocked = isUnlockedForView(capsuleDoc);
  const canViewContent = role === "owner" || role === "editor" || unlocked;

  if (!canViewContent) {
    capsule.message = "";
    capsule.images = [];
    capsule.memories = [];
  }

  capsule.currentUserRole = role;
  capsule.canEdit = canEditCapsule(capsuleDoc, role);
  capsule.canLock = capsule.isCollaborative && !capsule.isLocked && role === "owner";
  capsule.canViewContent = canViewContent;
  capsule.isReadyToView = unlocked;

  return capsule;
};

const getMailer = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_USER,
    MAIL_PASS,
    MAIL_FROM,
  } = process.env;

  const host = SMTP_HOST;
  const user = SMTP_USER || MAIL_USER;
  const pass = SMTP_PASS || MAIL_PASS;

  if (!host || !user || !pass) return null;

  return {
    transporter: nodemailer.createTransport({
      host,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user, pass },
    }),
    from: MAIL_FROM || user,
  };
};

const sendInviteEmail = async ({ to, capsuleTitle, role, ownerName, capsuleId }) => {
  const mailer = getMailer();

  if (!mailer) {
    console.log(`[Invite Mock] ${to} invited to "${capsuleTitle}" as ${role}`);
    return;
  }

  await mailer.transporter.sendMail({
    from: mailer.from,
    to,
    subject: `Invitation to collaborate on ${capsuleTitle}`,
    text: `${ownerName} invited you as a ${role} on "${capsuleTitle}". Open Capsule, go to Shared Sanctuary, and accept or reject the invite there. Capsule ID: ${capsuleId}`,
  });
};

const fileToDataUri = (file) => {
  if (!file?.buffer) return "";
  const mimeType = file.mimetype || "application/octet-stream";
  return `data:${mimeType};base64,${file.buffer.toString("base64")}`;
};

const buildCapsuleMemories = (files, textMemories = []) => {
  const memories = [];
  const images = [];

  (files || [])
    .filter((file) => file.fieldname === "image")
    .forEach((file) => {
      const encodedImage = fileToDataUri(file);
      images.push(encodedImage);
      memories.push({
        type: "photo",
        content: file.originalname,
        preview: encodedImage,
      });
    });

  (textMemories || []).forEach((content) => {
    if (typeof content === "string" && content.trim()) {
      memories.push({
        type: "text",
        content: content.trim(),
        preview: "",
      });
    }
  });

  (files || [])
    .filter((file) => file.fieldname === "audio" || file.fieldname === "song")
    .forEach((file) => {
      const encodedAudio = fileToDataUri(file);
      memories.push({
        type: "audio",
        content: file.originalname,
        preview: encodedAudio,
        mediaKind: file.fieldname === "song" ? "song" : "voice",
      });
    });

  return { memories, images };
};

const populateCapsuleQuery = (query) =>
  query
    .populate("userId", "name email")
    .populate("members.user", "name email")
    .populate("invites.invitedBy", "name email");

exports.createCapsule = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id);
    const membersInput = req.body.members ? JSON.parse(req.body.members) : [];
    const textMemories = req.body.textMemories ? JSON.parse(req.body.textMemories) : [];
    const isPrivate = String(req.body.isPrivate) === "true";
    const isCollaborative = String(req.body.isCollaborative) === "true" || !isPrivate;
    const { memories, images } = buildCapsuleMemories(req.files || [], textMemories);

    const invites = membersInput
      .map((member) => ({
        email: normalizeEmail(member.email),
        role: member.role === "editor" ? "editor" : "viewer",
        invitedBy: req.user.id,
      }))
      .filter(
        (invite, index, list) =>
          invite.email &&
          invite.email !== normalizeEmail(owner?.email) &&
          list.findIndex((entry) => entry.email === invite.email) === index
      );

    const capsule = await Capsule.create({
      title: req.body.title,
      message: req.body.message || "",
      unlockDate: req.body.unlockDate,
      mood: req.body.mood,
      isPrivate: isCollaborative ? false : isPrivate,
      userId: req.user.id,
      members: [],
      invites,
      isCollaborative,
      isLocked: false,
      lockedBy: null,
      images,
      memories,
    });

    await Promise.allSettled(
      invites.map((invite) =>
        sendInviteEmail({
          to: invite.email,
          capsuleTitle: capsule.title,
          role: invite.role,
          ownerName: owner?.name || "A Capsule user",
          capsuleId: capsule._id.toString(),
        })
      )
    );

    const populated = await populateCapsuleQuery(Capsule.findById(capsule._id));
    res.json(formatCapsuleForUser(populated, req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating capsule" });
  }
};

exports.getCapsules = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userEmail = normalizeEmail(user?.email);

    const capsules = await populateCapsuleQuery(
      Capsule.find({
        $or: [{ userId: req.user.id }, { "members.user": req.user.id }, { "invites.email": userEmail }],
      }).sort({ createdAt: -1 })
    );

    const visibleCapsules = capsules
      .filter((capsule) => {
        const role = getUserRole(capsule, req.user.id);
        const hasInvite = capsule.invites.some((invite) => normalizeEmail(invite.email) === userEmail);
        return Boolean(role) || hasInvite;
      })
      .map((capsule) => formatCapsuleForUser(capsule, req.user.id));

    res.json(visibleCapsules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching capsules" });
  }
};

exports.getCapsuleById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userEmail = normalizeEmail(user?.email);
    const capsule = await populateCapsuleQuery(Capsule.findById(req.params.id));

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    const role = getUserRole(capsule, req.user.id);
    const hasInvite = capsule.invites.some((invite) => normalizeEmail(invite.email) === userEmail);

    if (!role && !hasInvite) {
      return res.status(403).json({ message: "You do not have access to this capsule" });
    }

    res.json(formatCapsuleForUser(capsule, req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching capsule" });
  }
};

exports.inviteCollaborator = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = req.body.role === "editor" ? "editor" : "viewer";
    const capsule = await populateCapsuleQuery(Capsule.findById(req.params.id));

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });
    if (getUserRole(capsule, req.user.id) !== "owner") {
      return res.status(403).json({ message: "Only the creator can invite collaborators" });
    }
    if (!email) return res.status(400).json({ message: "Collaborator email is required" });
    if (email === normalizeEmail(capsule.userId?.email)) {
      return res.status(400).json({ message: "Creator is already part of the capsule" });
    }

    const existingMember = capsule.members.find(
      (member) => member.status === "accepted" && normalizeEmail(member.user?.email || "") === email
    );

    if (existingMember) {
      return res.status(400).json({ message: "This user already joined the capsule" });
    }

    const existingInvite = capsule.invites.find((invite) => normalizeEmail(invite.email) === email);

    if (existingInvite) {
      existingInvite.role = role;
      existingInvite.invitedBy = req.user.id;
      existingInvite.createdAt = new Date();
    } else {
      capsule.invites.push({ email, role, invitedBy: req.user.id });
    }

    capsule.isCollaborative = true;
    capsule.isPrivate = false;
    await capsule.save();

    await sendInviteEmail({
      to: email,
      capsuleTitle: capsule.title,
      role,
      ownerName: capsule.userId?.name || "A Capsule user",
      capsuleId: capsule._id.toString(),
    });

    const refreshed = await populateCapsuleQuery(Capsule.findById(capsule._id));

    res.json({
      message: "Invite sent",
      capsule: formatCapsuleForUser(refreshed, req.user.id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending invite" });
  }
};

exports.getMyInvites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userEmail = normalizeEmail(user?.email);
    const capsules = await populateCapsuleQuery(Capsule.find({ "invites.email": userEmail }));

    const invites = [];

    capsules.forEach((capsule) => {
      capsule.invites.forEach((invite) => {
        if (normalizeEmail(invite.email) === userEmail) {
          invites.push({
            capsuleId: capsule._id,
            title: capsule.title,
            role: invite.role,
            invitedBy: invite.invitedBy?.name || capsule.userId?.name || "Unknown",
            createdAt: invite.createdAt || capsule.createdAt,
          });
        }
      });
    });

    invites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching invites" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    const user = await User.findById(req.user.id);
    const email = normalizeEmail(user?.email);

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    const invite = capsule.invites.find((entry) => normalizeEmail(entry.email) === email);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    const existingMember = capsule.members.find((member) => member.user?.toString() === req.user.id);
    if (existingMember) {
      existingMember.role = invite.role;
      existingMember.status = "accepted";
    } else {
      capsule.members.push({
        user: user._id,
        role: invite.role,
        status: "accepted",
      });
    }

    capsule.invites = capsule.invites.filter((entry) => normalizeEmail(entry.email) !== email);
    capsule.isCollaborative = true;
    capsule.isPrivate = false;
    await capsule.save();

    const refreshed = await populateCapsuleQuery(Capsule.findById(capsule._id));
    res.json({ message: "Accepted", capsule: formatCapsuleForUser(refreshed, req.user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting invite" });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    const user = await User.findById(req.user.id);
    const email = normalizeEmail(user?.email);

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    capsule.invites = capsule.invites.filter((entry) => normalizeEmail(entry.email) !== email);
    await capsule.save();

    res.json({ message: "Rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting invite" });
  }
};

exports.addCapsuleMemories = async (req, res) => {
  try {
    const capsule = await populateCapsuleQuery(Capsule.findById(req.params.id));

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    const role = getUserRole(capsule, req.user.id);
    if (!canEditCapsule(capsule, role)) {
      return res
        .status(403)
        .json({ message: "Only the owner or accepted editors can add memories before locking" });
    }

    const textMemories = req.body.textMemories ? JSON.parse(req.body.textMemories) : [];
    const { memories, images } = buildCapsuleMemories(req.files || [], textMemories);

    capsule.memories.push(...memories);
    capsule.images.push(...images);
    await capsule.save();

    const refreshed = await populateCapsuleQuery(Capsule.findById(capsule._id));
    req.app.get("io")?.to(req.params.id).emit("capsuleUpdated", { capsuleId: req.params.id });

    res.json(formatCapsuleForUser(refreshed, req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating capsule" });
  }
};

exports.lockCapsule = async (req, res) => {
  try {
    const capsule = await populateCapsuleQuery(Capsule.findById(req.params.id));

    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    if (getUserRole(capsule, req.user.id) !== "owner") {
      return res.status(403).json({ message: "Only the creator can lock this capsule" });
    }

    capsule.isLocked = true;
    capsule.lockedBy = req.user.id;
    await capsule.save();

    const refreshed = await populateCapsuleQuery(Capsule.findById(capsule._id));
    req.app.get("io")?.to(req.params.id).emit("capsuleUpdated", { capsuleId: req.params.id });

    res.json(formatCapsuleForUser(refreshed, req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error locking capsule" });
  }
};



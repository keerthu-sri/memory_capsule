const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   ✅ CORS CONFIG (UPDATED)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://memory-capsule-murex.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

/* =========================
   ✅ STATIC FILES
========================= */
app.use("/uploads", express.static("uploads"));

/* =========================
   ✅ CRON JOB
========================= */
require("./cron");

/* =========================
   ✅ ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/capsules", require("./routes/capsuleRoutes"));
app.use("/api/memories", require("./routes/memoryRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));

/* =========================
   ✅ MONGODB (FIXED)
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

/* =========================
   ✅ TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

/* =========================
   ✅ SOCKET.IO
========================= */
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinCapsule", (capsuleId) => {
    socket.join(capsuleId);
  });
});

/* =========================
   ✅ PORT (IMPORTANT FIX)
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
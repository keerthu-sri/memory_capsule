const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Middleware (VERY IMPORTANT)
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://memory-capsule-murex.vercel.app/"];
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no origin) and configured frontend origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

// ✅ Cron Job
require("./cron");

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/capsules", require("./routes/capsuleRoutes"));
app.use("/api/memories", require("./routes/memoryRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/members", require("./routes/memberRoutes"));
app.use("/uploads", express.static("uploads"));

// ✅ MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/memory_capsule")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server + DB working");
});

// ✅ Start server
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("joinCapsule", (capsuleId) => {
    socket.join(capsuleId);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});

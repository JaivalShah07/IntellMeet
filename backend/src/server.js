require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const ensureDemoUser = require("./config/ensureDemoUser");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const meetingRoutes = require("./routes/meeting.routes");
const taskRoutes = require("./routes/task.routes");
const aiRoutes = require("./routes/ai.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function start() {
  await connectDB();
  await ensureDemoUser();

  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
  });

  app.use(helmet());
  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many attempts, try again later" },
  });

  app.get("/api/health", (_, res) => {
    res.json({
      success: true,
      service: "IntellMeet API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/meetings", meetingRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/analytics", analyticsRoutes);

  const meetingMessages = new Map();

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userName }) => {
      socket.join(roomId);
      socket.data.userName = userName || "Guest";
      socket.to(roomId).emit("user-joined", { userName: socket.data.userName });
    });

    socket.on("chat-message", ({ roomId, message }) => {
      const payload = {
        userName: socket.data.userName || "Guest",
        message,
        at: new Date().toISOString(),
      };
      if (!meetingMessages.has(roomId)) meetingMessages.set(roomId, []);
      meetingMessages.get(roomId).push(payload);
      io.to(roomId).emit("chat-message", payload);
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("user-left", { userName: socket.data.userName });
        }
      }
    });
  });

  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`IntellMeet API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

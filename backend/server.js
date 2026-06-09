require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");
const { initializeSockets } = require("./sockets/socket");

const authRoutes = require("./routes/auth.routes");
const meetingRoutes = require("./routes/meeting.routes");
const taskRoutes = require("./routes/task.routes");
const aiRoutes = require("./routes/ai.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function start() {
  await connectDB();

  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { 
      origin: [CLIENT_URL, "https://intellmeet-m1au.onrender.com"], 
      methods: ["GET", "POST"],
      credentials: true 
    },
  });

  app.use(helmet());
  app.use(
    cors({
      origin: [CLIENT_URL, "http://127.0.0.1:5173"],
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
  app.use("/api/teams", require("./routes/team.routes"));
  app.use("/api/meetings", meetingRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/analytics", analyticsRoutes);

  initializeSockets(io);

  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`IntellMeet API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

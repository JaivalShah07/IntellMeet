const mongoose = require("mongoose");
const dns = require("dns");

let memoryServer = null;

async function connectDB() {
  const explicitUri = process.env.MONGODB_URI?.trim();
  const useMemory = process.env.USE_MEMORY_DB === "true";

  if (useMemory) {
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log("\n==================================================");
      console.log("MongoDB connected: IN-MEMORY DATABASE");
      console.log("Note: Data resets when the server is restarted.");
      console.log("==================================================\n");
      return;
    } catch (memErr) {
      console.error("Failed to start MongoDB Memory Server:", memErr.message);
      throw memErr;
    }
  }

  const uri = explicitUri || "mongodb://127.0.0.1:27017/intellmeet";
  
  const tryConnect = async (dbUri) => {
    await mongoose.connect(dbUri);
  };

  try {
    await tryConnect(uri);
    console.log("MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
  } catch (err) {
    console.error("\nMongoDB connection failed:", err.message);
    
    // DNS resolution retry
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.message.includes("querySrv")) {
      const currentServers = dns.getServers();
      console.log("Current Node.js DNS Servers:", currentServers);
      console.warn("[WARNING] DNS resolution failed. Retrying connection with Google/Cloudflare DNS servers...");
      try {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
        await tryConnect(uri);
        console.log("MongoDB connected successfully after DNS override!");
        return;
      } catch (retryErr) {
        console.error("Connection failed even with public DNS servers:", retryErr.message);
      }
    }
    
    // Auto-fallback to memory server in development/local environment
    if (process.env.NODE_ENV !== "production") {
      console.warn("\n[WARNING] Attempting auto-fallback to MongoDB Memory Server for local development...");
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log("\n==================================================");
        console.log("MongoDB connected: AUTO-FALLBACK IN-MEMORY DATABASE");
        console.log("Your configured connection failed, but the server has started");
        console.log("using a temporary database so you can keep working.");
        console.log("Note: Data resets when the server is restarted.");
        console.log("==================================================\n");
        return;
      } catch (fallbackErr) {
        console.error("Auto-fallback failed:", fallbackErr.message);
      }
    }
    
    throw err;
  }
}

module.exports = connectDB;
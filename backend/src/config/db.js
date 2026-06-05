const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const explicitUri = process.env.MONGODB_URI?.trim();
  const useMemory =
    process.env.USE_MEMORY_DB === "true" ||
    (!explicitUri && process.env.NODE_ENV !== "production");

  if (useMemory) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log("MongoDB connected (in-memory — no install needed)");
    console.log("   Data resets when you stop the server. For permanent DB, see docs/MONGODB_SETUP.md");
    return;
  }

  const uri = explicitUri || "mongodb://127.0.0.1:27017/intellmeet";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
  } catch (err) {
    console.error("\nMongoDB connection failed:", err.message);
    console.error(
      "\nQuick fix — use in-memory DB (zero setup):\n" +
        "  1. Open backend/.env\n" +
        "  2. Add this line: USE_MEMORY_DB=true\n" +
        "  3. Remove or comment out MONGODB_URI\n" +
        "  4. Run: npm run dev\n\n" +
        "Or follow: docs/MONGODB_SETUP.md\n"
    );
    throw err;
  }
}

module.exports = connectDB;

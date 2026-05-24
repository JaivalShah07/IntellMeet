const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
  } catch (err) {
    console.error("\nMongoDB connection failed:", err.message);
    throw err;
  }
}

module.exports = connectDB;
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

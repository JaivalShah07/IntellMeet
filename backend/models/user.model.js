const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: ["member", "admin", "Member", "Admin"], default: "member", lowercase: true },
    avatar: { type: String, default: "" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, sparse: true, unique: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  // Skip if already a bcrypt hash (e.g. re-save)
  if (this.password.startsWith("$2")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
  };
};

module.exports = mongoose.model("User", userSchema);

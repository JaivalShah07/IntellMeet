const User = require("../models/User");

async function ensureDemoUser() {
  const count = await User.countDocuments();
  if (count > 0) return;

  await User.create({
    name: "Demo User",
    email: "demo@intellmeet.com",
    password: "demo123",
    role: "admin",
  });

  console.log("Demo user created: demo@intellmeet.com / demo123");
}

module.exports = ensureDemoUser;

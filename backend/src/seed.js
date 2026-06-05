require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./config/db");
const User = require("./models/User");
const Meeting = require("./models/Meeting");
const Task = require("./models/Task");

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Meeting.deleteMany({}), Task.deleteMany({})]);

  const demo = await User.create({
    name: "Demo User",
    email: "demo@intellmeet.com",
    password: "demo123",
    role: "admin",
  });

  const now = Date.now();
  const meetings = await Meeting.insertMany([
    {
      title: "Weekly Sync — Product Team",
      host: demo._id,
      roomId: uuidv4().slice(0, 8),
      scheduledAt: new Date(now + 3600000),
      type: "Video",
      participants: [demo._id],
      summary: "Team aligned on Q3 roadmap with strong engagement.",
      sentimentScore: 89,
    },
    {
      title: "Design Review: Q3 Roadmap",
      host: demo._id,
      roomId: uuidv4().slice(0, 8),
      scheduledAt: new Date(now + 7200000),
      type: "Presentation",
      participants: [demo._id],
    },
    {
      title: "Client Onboarding: Acme Corp",
      host: demo._id,
      roomId: uuidv4().slice(0, 8),
      scheduledAt: new Date(now + 10800000),
      type: "External",
      participants: [demo._id],
    },
  ]);

  await Task.insertMany([
    { title: "Design UI mockups", status: "todo", createdBy: demo._id, assignee: demo._id },
    { title: "Setup API structure", status: "todo", createdBy: demo._id, assignee: demo._id },
    { title: "Build dashboard UI", status: "in_progress", createdBy: demo._id, assignee: demo._id },
    { title: "Project setup completed", status: "done", createdBy: demo._id, assignee: demo._id },
    {
      title: "Finalize Q3 marketing budget",
      status: "todo",
      createdBy: demo._id,
      assignee: demo._id,
      meeting: meetings[0]._id,
    },
  ]);

  console.log("Seed complete — demo@intellmeet.com / demo123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

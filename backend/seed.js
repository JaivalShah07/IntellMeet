require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./config/db");
const User = require("./models/user.model");
const Meeting = require("./models/meeting.model");
const Task = require("./models/task.model");
const Team = require("./models/team.model");

async function seed() {
  await connectDB();
  
  console.log("Clearing database...");
  await Promise.all([
    User.deleteMany({}),
    Meeting.deleteMany({}),
    Task.deleteMany({}),
    Team.deleteMany({})
  ]);

  console.log("Creating users...");
  // Create Demo Admin User
  const demoAdmin = await User.create({
    name: "Demo Admin",
    email: "demo@intellmeet.com",
    password: "demo123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
  });

  // Create Mock Members
  const jane = await User.create({
    name: "Jane Doe",
    email: "jane@intellmeet.com",
    password: "demo123",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
  });

  const bob = await User.create({
    name: "Bob Smith",
    email: "bob@intellmeet.com",
    password: "demo123",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
  });

  const alice = await User.create({
    name: "Alice Johnson",
    email: "alice@intellmeet.com",
    password: "demo123",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80"
  });

  console.log("Creating default team...");
  const team = await Team.create({
    name: "IntellMeet core team",
    owner: demoAdmin._id,
    members: [demoAdmin._id, jane._id, bob._id, alice._id]
  });

  console.log("Creating mock meetings...");
  const now = new Date();
  
  // Completed meetings (History)
  const pastMeeting1 = await Meeting.create({
    title: "Sprint Planning & Roadmap review",
    host: demoAdmin._id,
    roomId: uuidv4().slice(0, 8),
    scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    durationMinutes: 45,
    type: "Standup",
    status: "completed",
    participants: [demoAdmin._id, jane._id, bob._id],
    transcript: "Demo Admin: Let's start the planning. Jane, what's your status? Jane: I will build the dashboard components. Bob: I will finish database modeling and API integrations. Demo Admin: Sounds good. Let's make sure everything connects by Wednesday.",
    summary: "The team aligned on the sprint roadmap. Jane will focus on frontend dashboard components, while Bob takes on backend modeling and API connections. Project timelines are on track for Wednesday delivery.",
    sentimentScore: 92,
    hasRecording: true,
    notes: "Approved roadmap, frontend tasks prioritized."
  });

  const pastMeeting2 = await Meeting.create({
    title: "Design Alignments: Dashboard UI/UX",
    host: jane._id,
    roomId: uuidv4().slice(0, 8),
    scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    durationMinutes: 60,
    type: "Presentation",
    status: "completed",
    participants: [demoAdmin._id, jane._id, alice._id],
    summary: "Reviewed new Figma boards for dashboard home layout. Discussed theme toggle placement and sidebar design. Alice suggested adding a glassmorphism style card. Jane will apply the design choices.",
    sentimentScore: 84,
    hasRecording: false,
    notes: "Theme toggle will be at top right of the navbar. Glassmorphism cards approved."
  });

  // Upcoming meetings (Scheduled)
  const upcomingMeeting1 = await Meeting.create({
    title: "Weekly Sync — Product Team",
    host: demoAdmin._id,
    roomId: uuidv4().slice(0, 8),
    scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // In 2 hours
    durationMinutes: 30,
    type: "Video",
    status: "scheduled",
    participants: [demoAdmin._id, jane._id, bob._id, alice._id],
    description: "Align on the weekly goals and verify our full-stack integrations are solid."
  });

  const upcomingMeeting2 = await Meeting.create({
    title: "AI Integrations & Sentiment Review",
    host: bob._id,
    roomId: uuidv4().slice(0, 8),
    scheduledAt: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow
    durationMinutes: 45,
    type: "Presentation",
    status: "scheduled",
    participants: [demoAdmin._id, bob._id, alice._id],
    description: "Discuss how we process meeting transcripts and retrieve summaries/sentiment using the Gemini API."
  });

  const upcomingMeeting3 = await Meeting.create({
    title: "SaaS Launch Prep & Marketing",
    host: demoAdmin._id,
    roomId: uuidv4().slice(0, 8),
    scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
    durationMinutes: 60,
    type: "External",
    status: "scheduled",
    participants: [demoAdmin._id, jane._id],
    description: "Prepare assets, pricing plans, and onboarding materials for initial beta users."
  });

  console.log("Creating tasks...");
  await Task.insertMany([
    { title: "Design modern dashboard layout", status: "done", createdBy: demoAdmin._id, assignee: jane._id },
    { title: "Configure local memory database fallback", status: "done", createdBy: demoAdmin._id, assignee: bob._id },
    { title: "Implement Create Meeting API and participant list", status: "in_progress", createdBy: demoAdmin._id, assignee: bob._id },
    { title: "Build animated profile dropdown and top bar layout", status: "todo", createdBy: demoAdmin._id, assignee: jane._id },
    { title: "Add skeleton card loaders to dashboard page", status: "todo", createdBy: demoAdmin._id, assignee: jane._id },
    { title: "Review transcript summaries and sentiment with Gemini", status: "todo", createdBy: demoAdmin._id, assignee: alice._id, meeting: upcomingMeeting2._id },
  ]);

  console.log("-----------------------------------------");
  console.log("Seed completed successfully!");
  console.log("Demo Admin Email: demo@intellmeet.com");
  console.log("Demo Admin Password: demo123");
  console.log("Other seeded users: jane@intellmeet.com, bob@intellmeet.com, alice@intellmeet.com");
  console.log("-----------------------------------------");
  process.exit(0);
}

if (require.main === module) {
  seed().catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  });
} else {
  module.exports = seed;
}

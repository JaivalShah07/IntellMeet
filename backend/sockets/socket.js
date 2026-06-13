const Meeting = require("../models/meeting.model");
const meetingMessages = new Map();

function initializeSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId, userName }) => {
      try {
        const meeting = await Meeting.findOne({ roomId });
        if (meeting) {
          if (meeting.status === "completed") {
            socket.emit("meeting-ended", { message: "This meeting has already ended and cannot be joined." });
            return;
          }
          if (meeting.status === "scheduled") {
            meeting.status = "live";
            await meeting.save();
          }
        }
        socket.join(roomId);
        socket.data.userName = userName || "Guest";
        socket.data.roomId = roomId;
        socket.to(roomId).emit("user-joined", { userName: socket.data.userName, socketId: socket.id });
        
        if (meeting) {
          socket.emit("notes-update", { notes: meeting.notes || "" });
        }
      } catch (err) {
        console.error("Error in join-room socket handler:", err);
      }
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

    socket.on("transcript", ({ roomId, text, userName }) => {
      io.to(roomId).emit("transcript", { text, userName });
    });

    socket.on("notes-edit", async ({ roomId, notes }) => {
      try {
        socket.to(roomId).emit("notes-update", { notes });
        await Meeting.findOneAndUpdate({ roomId }, { notes });
      } catch (err) {
        console.error("Error in notes-edit socket handler:", err);
      }
    });

    socket.on("task-created", ({ roomId, task }) => {
      socket.to(roomId).emit("task-created", { task });
    });

    // WebRTC Signaling
    socket.on("webrtc-offer", ({ offer, to }) => {
      socket.to(to).emit("webrtc-offer", { offer, from: socket.id, userName: socket.data.userName });
    });

    socket.on("webrtc-answer", ({ answer, to }) => {
      socket.to(to).emit("webrtc-answer", { answer, from: socket.id, userName: socket.data.userName });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("user-left", { userName: socket.data.userName, socketId: socket.id });
        }
      }
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        // Wait 5 seconds before checking room membership to prevent reloads/temporary drops from terminating the room
        setTimeout(async () => {
          const clients = io.sockets.adapter.rooms.get(roomId);
          const numClients = clients ? clients.size : 0;
          if (numClients === 0) {
            console.log(`Auto-completing empty meeting room: ${roomId}`);
            try {
              const meeting = await Meeting.findOne({ roomId });
              if (meeting && meeting.status !== "completed") {
                meeting.status = "completed";
                await meeting.save();
              }
            } catch (err) {
              console.error("Error auto-completing meeting on disconnect:", err);
            }
          }
        }, 5000);
      }
    });
  });
}

module.exports = { initializeSockets };

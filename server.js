const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins (Adjust in production)
  },
});

app.use(cors());

let candidateData = {}; // Store live candidate data

// Handle client connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Candidate sends live updates
  socket.on("candidateUpdate", (data) => {
    const { candidateId, sessionData, batteryLife } = data;
    candidateData[candidateId] = {
      sessionData,
      batteryLife,
      lastUpdate: new Date(),
    };

    console.log(`Update from Candidate ${candidateId}:`, data);

    // Broadcast to all admins
    io.emit("adminViewUpdate", { candidateId, sessionData, batteryLife });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});


//server.js
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const http = require("http");
const ACTIONS = require("./src/Action");
const path = require("path");

const server = http.createServer(app);

// Enable CORS for development
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app address
    methods: ["GET", "POST"],
  },
});

// Serve static files from the React build folder
app.use(express.static("build"));

// Handle all other routes with the React app
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Helper function to get all connected clients in a room
const getAllConnectedClients = (id) => {
  return Array.from(io.sockets.adapter.rooms.get(id) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
};

const userSocketMap = {};
const doubts = {};

// WebSocket connection logic
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on(ACTIONS.JOIN, ({ id, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(id);

    socket.emit("user-joined", {
      socketId: socket.id,
      username: username,
    });

    console.log("User joined:", socket.id, username);

    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("lock_access", ({ id, access }) => {
    console.log("Access change:", access);
    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("access_change", { access });
    });
  });

  socket.on(ACTIONS.DOUBT, ({ id, username, doubt }) => {
    doubts[username] = doubt;
    console.log("Doubts:", doubts);

    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.DOUBT, {
        doubts,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ id, code }) => {
    socket.to(id).emit(ACTIONS.SYNC_CODE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// Set the port
const PORT = process.env.PORT || 8000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

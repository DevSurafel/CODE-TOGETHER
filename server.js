const express = require("express");
const { Server } = require("socket.io");
const app = express();
const http = require("http");
const ACTIONS = require("./src/Action");
const path = require("path");
const server = http.createServer(app);

// Dynamically set CORS origin
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Use environment variable for the React app URL
    methods: ["GET", "POST"],
  },
});

// Serve static files for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server running in development mode.");
  });
}

// Helper function to get all connected clients in a room
const getAllConnectedClients = (id) => {
  return Array.from(io.sockets.adapter.rooms.get(id) || []).map((socketId) => {
    return { socketId, username: userSocketMap[socketId] };
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

    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, { clients, username, socketId: socket.id });
    });
  });

  socket.on("lock_access", ({ id, access }) => {
    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("access_change", { access });
    });
  });

  socket.on(ACTIONS.DOUBT, ({ id, username, doubt }) => {
    doubts[username] = doubt;
    const clients = getAllConnectedClients(id);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.DOUBT, { doubts, username, socketId: socket.id });
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

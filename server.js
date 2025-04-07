require('dotenv').config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const ACTIONS = require("./src/Action");

const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "https://code-together-l4kv.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

// Socket.IO Setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "https://code-together-l4kv.onrender.com",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000
  }
});

// Connection Management
const userSocketMap = {};
const roomStates = {};

const getRoomClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => ({
    socketId,
    username: userSocketMap[socketId]
  }));
};

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Enhanced JOIN handler with validation
  socket.on(ACTIONS.JOIN, ({ roomId, username }, callback) => {
    if (!roomId || !username) {
      return callback({ error: "Room ID and username are required" });
    }

    // Clear previous room if reconnecting
    if (userSocketMap[socket.id]) {
      socket.rooms.forEach(room => socket.leave(room));
    }

    userSocketMap[socket.id] = username;
    socket.join(roomId);

    // Initialize room state if needed
    if (!roomStates[roomId]) {
      roomStates[roomId] = {
        code: '',
        access: false,
        doubts: {}
      };
    }

    const clients = getRoomClients(roomId);
    
    // Send current room state to new user
    callback({
      clients,
      roomState: roomStates[roomId]
    });

    // Notify others
    socket.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id
    });

    console.log(`${username} joined ${roomId}`);
  });

  // [Keep your existing lock_access, DOUBT, CODE_CHANGE handlers]
  // Add this new handler for client disconnection
  socket.on('disconnect', () => {
    const username = userSocketMap[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      delete userSocketMap[socket.id];
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    connections: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
  Server running on port ${PORT}
  Allowed origins: ${process.env.FRONTEND_URL}
  Node ${process.version}
  `);
});

// Error Handling
process.on('uncaughtException', (err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

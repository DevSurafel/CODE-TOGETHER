const { Server } = require("socket.io");
const ACTIONS = require("../../src/Action");

let io;

exports.handler = async (event, context) => {
  // Prevent function timeout (Netlify-specific)
  context.callbackWaitsForEmptyEventLoop = false;

  if (!io) {
    const { createServer } = require("http");
    const server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("WebSocket Server is running.");
    });

    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    const userSocketMap = {};
    const doubts = {};

    // WebSocket connection logic
    io.on("connection", (socket) => {
      console.log("Connected:", socket.id);

      socket.on(ACTIONS.JOIN, ({ id, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(id);

        const clients = getAllConnectedClients(io, id);
        clients.forEach(({ socketId }) => {
          io.to(socketId).emit(ACTIONS.JOINED, {
            clients,
            username,
            socketId: socket.id,
          });
        });
      });

      socket.on("lock_access", ({ id, access }) => {
        const clients = getAllConnectedClients(io, id);
        clients.forEach(({ socketId }) => {
          io.to(socketId).emit("access_change", { access });
        });
      });

      socket.on(ACTIONS.DOUBT, ({ id, username, doubt }) => {
        doubts[username] = doubt;
        const clients = getAllConnectedClients(io, id);
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

    // Helper function to get all connected clients
    const getAllConnectedClients = (io, id) => {
      return Array.from(io.sockets.adapter.rooms.get(id) || []).map((socketId) => {
        return { socketId, username: userSocketMap[socketId] };
      });
    };

    server.listen(3001, () => {
      console.log("WebSocket server listening on port 3001");
    });
  }

  // Netlify requires a valid response
  return {
    statusCode: 200,
    body: "Serverless function is running.",
  };
};

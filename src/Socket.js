import { io } from "socket.io-client";

const SOCKET_CONFIG = {
  reconnectionAttempts: 5,
  reconnectionDelay: 5000,
  timeout: 30000, // Increased to 30s to handle Render wake-up delays
  transports: ["websocket", "polling"], // Added polling fallback
  autoConnect: false,
  withCredentials: true,
  forceNew: true,
  secure: true,
  rejectUnauthorized: false
};

export const initSocket = async () => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://ct-backend-dda5.onrender.com";
    console.log(`Connecting to: ${backendUrl}`);
    
    const socket = io(backendUrl, {
      ...SOCKET_CONFIG,
      query: { clientType: 'web' },
      path: '/socket.io'
    });

    return await new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        console.log('Connection timed out after 30s');
        reject(new Error('Connection timeout (30s)'));
      }, 30000);

      const cleanup = () => {
        clearTimeout(connectionTimeout);
        socket.off('connect', connectHandler);
        socket.off('connect_error', errorHandler);
        socket.off('disconnect', errorHandler);
      };

      const connectHandler = () => {
        cleanup();
        console.log("Connected with ID:", socket.id);
        resolve(socket);
      };

      const errorHandler = (err) => {
        cleanup();
        console.error("Connection failed:", err);
        reject(new Error(`Failed to connect: ${err.message}`));
      };

      socket.once('connect', connectHandler);
      socket.once('connect_error', errorHandler);
      socket.once('disconnect', errorHandler);
      socket.connect();
    });
  } catch (error) {
    console.error("Socket initialization error:", error);
    throw error;
  }
};

export const disconnectSocket = (socket) => {
  if (socket?.connected) {
    console.log(`Disconnecting socket ${socket.id}`);
    socket.removeAllListeners();
    socket.disconnect();
  }
};

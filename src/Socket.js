import { io } from "socket.io-client";

const SOCKET_CONFIG = {
  reconnectionAttempts: 5,
  reconnectionDelay: 5000,
  timeout: 20000,
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
  forceNew: true,
  secure: true, // Ensure secure connection
  rejectUnauthorized: false // Only for development if using self-signed certs
};

export const initSocket = async () => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://ct-backend-dda5.onrender.com";

    console.log(`Connecting to: ${backendUrl}`);
    
    const socket = io(backendUrl, {
      ...SOCKET_CONFIG,
      query: {
        clientType: 'web'
      },
      path: '/socket.io' // Explicit path
    });

    return await new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        reject(new Error('Connection timeout (20s)'));
      }, 20000);

      const connectHandler = () => {
        clearTimeout(connectionTimeout);
        console.log("Connected with ID:", socket.id);
        resolve(socket);
      };

      const errorHandler = (err) => {
        clearTimeout(connectionTimeout);
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

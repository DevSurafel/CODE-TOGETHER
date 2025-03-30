import { io } from "socket.io-client";

// Configuration constants
const SOCKET_CONFIG = {
  reconnectionAttempts: 5,          // More reliable than Infinity
  reconnectionDelay: 5000,          // 5 seconds between attempts
  timeout: 20000,                   // 20 second timeout
  transports: ["websocket"],        // Force WebSocket transport
  autoConnect: false,               // Manual connection
  withCredentials: true             // Required for Render CORS
};

export const initSocket = async () => {
  try {
    // Get backend URL with fallbacks
    const backendUrl = process.env.REACT_APP_API_URL || 
                      window.REACT_APP_API_URL || 
                      "http://localhost:8000";  // Match your backend port

    console.log(`Connecting to WebSocket at: ${backendUrl}`);
    
    const socket = io(backendUrl, SOCKET_CONFIG);

    return await new Promise((resolve, reject) => {
      // Success handler
      const connectHandler = () => {
        console.log("WebSocket connected:", socket.id);
        socket.off("connect_error", errorHandler); // Cleanup
        resolve(socket);
      };

      // Error handler
      const errorHandler = (err) => {
        console.error("Connection error:", err.message);
        socket.off("connect", connectHandler); // Cleanup
        reject(new Error(`Connection failed: ${err.message}`));
      };

      // Set temporary listeners
      socket.once("connect", connectHandler);
      socket.once("connect_error", errorHandler);

      // Manually connect (since autoConnect is false)
      socket.connect();
    });
  } catch (error) {
    console.error("WebSocket initialization error:", error);
    throw new Error("Failed to initialize WebSocket connection");
  }
};

// Optional: Export a clean disconnect function
export const disconnectSocket = (socket) => {
  if (socket) {
    console.log("Disconnecting socket:", socket.id);
    socket.disconnect();
  }
};

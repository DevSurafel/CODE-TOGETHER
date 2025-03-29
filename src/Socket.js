import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: Infinity,  // Fixed: Use `Infinity` (no quotes)
    timeout: 10000,
    transports: ["websocket"],
  };

  try {
    // Use environment variable for backend URL (configured in Render)
    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const socket = io(backendUrl, options);  // Removed Netlify-specific path

    return await new Promise((resolve, reject) => {
      socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
        resolve(socket);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
        reject(new Error("Socket connection failed. Please try again!"));
      });
    });
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
    throw error;
  }
};

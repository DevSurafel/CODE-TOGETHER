import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  try {
    const socket = io(`${process.env.REACT_APP_BACKEND_URL}/.netlify/functions/server`, options);

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

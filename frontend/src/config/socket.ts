import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("⚡ [Socket.IO Client] Connected to backend server:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ [Socket.IO Client] Disconnected from backend:", reason);
});

socket.on("connect_error", (error) => {
  console.error("⚠️ [Socket.IO Client] Connection Error:", error.message);
});

export default socket;
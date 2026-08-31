import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";

const PORT = process.env.PORT || 3000;

export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready on ws://localhost:${PORT}`);
});



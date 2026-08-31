import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./Config/socket";

const PORT = process.env.PORT || 3000;

export const server = http.createServer(app);

export const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready on ws://localhost:${PORT}`);
});

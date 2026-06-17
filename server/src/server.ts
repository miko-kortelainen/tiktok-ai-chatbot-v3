import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { initializeSocketHandlers } from "./sockets";
import { socketCorsOptions } from "./config/cors";
import { logger } from "./utils/logger";

export const server = createServer(app);

export const io = new Server(server, {
  cors: socketCorsOptions,
});

initializeSocketHandlers(io);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

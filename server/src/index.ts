import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./api/router";

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://localhost:8081", "http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

export const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

import { initializeSocketHandlers } from "./socketHandler";
initializeSocketHandlers(io);

app.use(express.json());

app.use("/api", router);
app.use("/", express.static("./dist/client"));
app.get("/{*splat}", (_req, res) => {
  res.sendFile("index.html", { root: "./dist/client" });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

import { Server } from "socket.io";
import { getQueue } from "./services/commentQueue";
import { handleTextToSpeechFinished, handleTikTokDisconnect, handleUsername } from "./services/tiktokHandler";

export function initializeSocketHandlers(io: Server) {
  io.on("connection", (socket: any) => {
    console.log(`Connected clients count: ${io.engine.clientsCount}`);

    // tiktokHandler event listeners
    socket.on("TikTokUsername", (data: string) => handleUsername(data));
    socket.on("DisconnectFromTikTok", () => handleTikTokDisconnect());

    // queue event listeners
    socket.emit("UpdateQueue", getQueue()); // Send the current queue to the client

    // ttsHandler event listeners
    socket.on("TextToSpeechStatus", (data: { status: string }) => {
      handleTextToSpeechFinished(data.status);
    });

    socket.on("disconnect", () => {
      console.log(`Connected clients count: ${io.engine.clientsCount}`);
    });
  });
}

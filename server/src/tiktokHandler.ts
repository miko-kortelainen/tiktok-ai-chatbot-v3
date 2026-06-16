import { ControlEvent, TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { io } from "./index";

import { checkQueueForComments, handleComment, setCommentProcessing } from "./commentHandler.js";
import { clearQueue } from "./commentQueue";
import { TikTokComment } from "./types/comment.type";

let tiktokUsername: string;

const USERNAME_MAX_LENGTH = 30;
const USERNAME_MIN_LENGTH = 4;

let tiktokLiveConnection: TikTokLiveConnection | null = null;

export function handleTextToSpeechFinished(status: string) {
  logger.info(`Text to speech status: ${status}`);
  setCommentProcessing(true);
  checkQueueForComments();
}

// Handle the connection to the TikTok live and the incoming comments
function handleTikTokLiveConnection() {
  if (!config.tiktokSessionId || !config.ttTargetIdc) {
    console.error("missing tt session id and/or targetIdc");
    return;
  }

  io.emit("ConnectionStatus", { type: "info", message: "Connecting..." });

  // Handle disconnection if there is already a connection to prevent multiple connections
  if (tiktokLiveConnection) {
    handleTikTokDisconnect();
    logger.info("Disconnected by new user.");
  }

  // Handle connecting to the live
  tiktokLiveConnection = new TikTokLiveConnection(tiktokUsername, {
    authenticateWs: true,
    session: {
      cookie: {
        type: "cookie",
        value: {
          sessionId: config.tiktokSessionId,
          ttTargetIdc: config.ttTargetIdc,
        },
      },
    },
  });

  // Connect to the TikTok live
  tiktokLiveConnection
    .connect()
    .then((state) => {
      logger.info(
        `Connected to roomId ${state.roomId}\n sessionID: ${config.tiktokSessionId}\n Live title: ${state.roomInfo?.title}`,
      );
      io.emit("ConnectionStatus", {
        type: "success",
        message: "Connected",
      });
    })
    .catch((err) => {
      logger.error("Failed to connect", err);
      io.emit("ConnectionStatus", {
        type: "error",
        message: "Error connecting.",
      });
    });

  // On a new comment event...
  tiktokLiveConnection.on(WebcastEvent.CHAT, (data) => {
    // Send the comment to handling with the neccesary parameters
    if (!data.user) return; // If user is undefined, return
    const comment: TikTokComment = {
      user: data.user.nickname,
      content: data.content,
      followRole: data.user.followStatus,
    };
    handleComment(comment); // followRole: 0 = none; 1 = follower; 2 = friends
  });

  // Log if the connection is disconnected from the tiktok live
  tiktokLiveConnection.on(ControlEvent.DISCONNECTED, () => logger.info("Disconnected from TikTok live"));

  // Function to handle a error on the connection
  tiktokLiveConnection.on(ControlEvent.ERROR, (err) => {
    console.error("Error!", err);
  });
}

// Function to handle the tiktok disconnection
export function handleTikTokDisconnect() {
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect(); // Disconnect from the TikTok live
    clearQueue(); // Clear the comment queue
  }
  setCommentProcessing(true); // Set comment processing back to true
}

// Function to handle the incoming TikTok username
export function handleUsername(incomingUsername: string) {
  if (!incomingUsername) {
    // username is empty
    logger.info(`[SERVER]: TIKTOK USERNAME CANT BE EMPTY`);
    emitConnectionStatus("error", "Username is empty");
    return;
  }
  if (incomingUsername.length < USERNAME_MIN_LENGTH || incomingUsername.length > USERNAME_MAX_LENGTH) {
    // username is invalid length
    logger.info(`[SERVER]: TIKTOK USERNAME IS INVALID LENGTH`);
    emitConnectionStatus("error", "Username invalid length");
    return;
  }

  // Check if the username starts with an @ symbol, if not, add it
  if (!incomingUsername.startsWith("@")) {
    incomingUsername = "@" + incomingUsername;
  }

  tiktokUsername = incomingUsername; // Set the TikTok username to the incoming username
  handleTikTokLiveConnection(); // Handle the connection to the TikTok live
}

// Function to emit the connection status
function emitConnectionStatus(type: string, message: string) {
  io.emit("ConnectionStatus", { type: type, message: message });
}

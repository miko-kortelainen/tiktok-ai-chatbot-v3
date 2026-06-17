import { ControlEvent, TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";
import { config } from "../config/envs";
import { logger } from "../utils/logger";
import { io } from "../server";

import { checkQueueForComments, handleComment, setCommentProcessing } from "./commentHandler.js";
import { clearQueue } from "./commentQueue";
import { TikTokComment } from "../models/comment.type";

const USERNAME_MAX_LENGTH = 30;
const USERNAME_MIN_LENGTH = 4;

let tiktokLiveConnection: TikTokLiveConnection | null = null;

export function handleTextToSpeechFinished(status: string) {
  logger.info(`[3/3] Text to speech status: ${status}`);
  setCommentProcessing(true);
  checkQueueForComments();
}

// start the tiktok live connection and chat listener
async function handleTikTokLiveConnection(tiktokUsername: string) {
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

  // tiktok live connection options
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

  try {
    // connect to the tiktok live
    const connectionState = await tiktokLiveConnection.connect();

    logger.info(
      `Connected to roomId ${connectionState.roomId}\n sessionID: ${config.tiktokSessionId}\n Live title: ${connectionState.roomInfo?.title}`,
    );
  } catch (err) {
    logger.error("Failed to connect to TikTok live: ", err);

    io.emit("ConnectionStatus", {
      type: "error",
      message: "Error connecting to live.",
    });
  }

  // tiktok live chat listener. "on a new chat =>"
  tiktokLiveConnection.on(WebcastEvent.CHAT, (data) => {
    if (!data.user) return; // If user is undefined, return

    const comment: TikTokComment = {
      user: data.user.nickname,
      content: data.content,
      followRole: data.user.followStatus,
    };

    handleComment(comment);
  });

  // tiktok live disconnection listener
  tiktokLiveConnection.on(ControlEvent.DISCONNECTED, () => logger.info("Disconnected from the TikTok live."));

  // tiktok live error listener
  tiktokLiveConnection.on(ControlEvent.ERROR, (err) => console.error("TikTok live connection error:", err));
}

// handle the incoming TikTok username
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

  handleTikTokLiveConnection(incomingUsername); // Handle the connection to the TikTok live
}

// handle the tiktok disconnection
export function handleTikTokDisconnect() {
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect(); // Disconnect from the TikTok live
    clearQueue(); // Clear the comment queue
  }
  setCommentProcessing(true); // Set comment processing back to true
}

// function to emit the connection status
function emitConnectionStatus(type: string, message: string) {
  io.emit("ConnectionStatus", { type: type, message: message });
}

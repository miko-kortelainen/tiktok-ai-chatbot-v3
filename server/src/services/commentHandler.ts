import { io } from "../server";
import { logger } from "../utils/logger";
import { enqueue, dequeue, size } from "./commentQueue";
import { getAiResponse } from "./gptHandler";
import { generateTextToSpeech } from "./ttsHandler";
import { TikTokComment } from "../models/comment.type";

let allowCommentProcessing: boolean = true;

let prevComment: TikTokComment = { user: "", content: "", followRole: "" };

export const setCommentProcessing = (b: boolean) => (allowCommentProcessing = b);

export function handleComment(comment: TikTokComment) {
  if (!commentValidator(comment.content)) return;

  logger.info(`[1/3] Handling comment [USER:${comment.user}]`);

  // move comment to queue if already processing previous
  if (!allowCommentProcessing) {
    const addedToQueue = enqueue(comment); // Add comment to queue
    if (!addedToQueue) return;
  }

  // no queue => process comment immediately
  processComment(comment);
}

async function processComment(comment: TikTokComment) {
  allowCommentProcessing = false; // Disable comment processing to prevent multiple comments being processed at the same time
  prevComment = comment; // Set the previous comment to the current comment to prevent duplicate comments

  logger.info(`[2/3] Processing comment [USER:${comment.user}]`);

  // emit the comment to the frontend
  io.emit("Comment", comment);

  // wait for AI response to the comment
  const response = await getAiResponse(comment);

  // generate TTS audio from the AI response
  let audio: string | null = null;
  try {
    audio = await generateTextToSpeech(response);
    logger.info("TTS generation successful");
  } catch (err) {
    logger.error("TTS generation failed:", err);
  }

  // emit the ai response with text and audio together
  io.emit("Answer", { text: response, audio });
}

export function checkQueueForComments() {
  logger.info(`Checking queue... Size: ${size()}, allowCommentProcessing: ${allowCommentProcessing}`);
  if (size() > 0) {
    const nextComment = dequeue();
    if (nextComment) {
      // Check if nextComment is not undefined
      logger.queue(`Processing next comment from queue. Queue size is now: ${size()}`);
      processComment(nextComment);
    }
  } else {
    logger.queue("Queue is empty, setting allowCommentProcessing to true");
    allowCommentProcessing = true;
  }
}

// Handles checking if the comment passes the rules
function commentValidator(content: string) {
  if (content === prevComment.content) {
    logger.info("IGNORING COMMENT: duplicate");
    return false;
  }

  if (content.startsWith("@")) {
    logger.info("IGNORING COMMENT: tagged user");
    return false;
  }

  if (content.length > 200 || content.length < 2) {
    logger.info("IGNORING COMMENT: invalid length");
    return false;
  }

  return true;
}

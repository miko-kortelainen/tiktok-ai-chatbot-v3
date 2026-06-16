import { io } from "./index";
import { logger } from "./utils/logger";
import { enqueue, dequeue, size } from "./commentQueue";
import { getAiResponse } from "./gptHandler";
import { TikTokComment } from "./types/comment.type";

let allowCommentProcessing: boolean = true;
let prevComment: TikTokComment = { user: "", content: "", followRole: "" };

export function setCommentProcessing(value: boolean) {
  allowCommentProcessing = value;
}

export function handleComment(comment: TikTokComment) {
  if (!commentValidator(comment.content)) return;

  logger.info(`Step 1: Handling comment from ${comment.user}`);

  // move comment to queue if already processing previous
  if (!allowCommentProcessing) {
    const addedToQueue = enqueue(comment); // Add comment to queue
    if (!addedToQueue) return;
  }

  // no queue => process comment immediately
  processComment(comment);
}

async function processComment(comment: TikTokComment) {
  logger.info(`Step 2: Processing comment from ${comment.user}`);

  allowCommentProcessing = false; // Disable comment processing to prevent multiple comments being processed at the same time
  prevComment = comment; // Set the previous comment to the current comment to prevent duplicate comments

  // Emits the comment to the frontend
  io.emit("Comment", comment);

  // Sends the comment with the needed parameters to the GPT handler
  const response = await getAiResponse(comment);
  io.emit("Answer", response); // Emit the ai response to the client
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

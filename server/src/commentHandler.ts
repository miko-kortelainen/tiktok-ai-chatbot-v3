import { io } from "./index";
import { logger } from "./utils/logger";
import { enqueue, dequeue, size } from "./commentQueue";
import { handleAnswer } from "./gptHandler";

let allowCommentProcessing: boolean = true;
let prevComment: string;

export function setCommentProcessing(value: boolean) {
  allowCommentProcessing = value;
  console.log(allowCommentProcessing);
}

export function handleTestComment(user: string, comment: string, followRole: string) {
  logger.info("Handling a test comment.");
  handleComment(user, comment, followRole);
}

export function handleComment(user: string, comment: string, followRole: string) {
  if (!commentRulesPassed(comment)) {
    return;
  }

  logger.info(`Step 1: Handling comment from ${user}`);

  // Adds comment to queue if another is being already processed, otherwise just process the comment.
  if (!allowCommentProcessing) {
    const addedToQueue = enqueue({ user, comment, followRole }); // Add comment to queue
    if (!addedToQueue) {
      logger.info("IGNORING COMMENT: Queue is full"); // Log that the comment was not added to the queue
    }
    return; // Return if the comment was not added to the queue (queue was full)
  }
  processComment(user, comment, followRole);
}

export function processComment(user: string, comment: string, followRole: string) {
  logger.info(`Step 2: Processing comment from ${user}`);

  allowCommentProcessing = false; // Disable comment processing to prevent multiple comments being processed at the same time
  prevComment = comment; // Set the previous comment to the current comment to prevent duplicate comments

  const formattedComment = `${user}: ${comment}`; // Format the comment with the username and the comment (e.g. "username: comment")

  // Sends the comment with the needed parameters to the GPT handler
  handleAnswer(formattedComment, followRole);

  // Emits the comment to the frontend
  io.emit("Comment", {
    type: "comment",
    commentUsername: user,
    commentText: comment,
    followRole: followRole,
  });
}

export function checkQueueForComments() {
  logger.info(`Checking queue... Size: ${size()}, allowCommentProcessing: ${allowCommentProcessing}`);
  if (size() > 0) {
    const nextComment = dequeue();
    if (nextComment) {
      // Check if nextComment is not undefined
      logger.queue(`Processing next comment from queue. Queue size is now: ${size()}`);
      processComment(nextComment.user, nextComment.comment, nextComment.followRole);
    }
  } else {
    logger.queue("Queue is empty, setting allowCommentProcessing to true");
    allowCommentProcessing = true;
  }
}

// Handles checking if the comment passes the rules
function commentRulesPassed(comment: string) {
  if (comment.startsWith("@") || comment.length > 200 || comment.length < 2 || comment === prevComment) {
    logger.info("IGNORING COMMENT: Failed comment rules");
    return false;
  } else {
    return true;
  }
}

import { io } from "./index";
import { TikTokComment } from "./types/comment.type";
import { logger } from "./utils/logger";

let queue: TikTokComment[] = [];
const maxSize = 10;

const emitQueueUpdate = () => {
  if (!io) return console.log("Socket.io not initialized, cannot emit queue update");
  io.emit("UpdateQueue", queue);
};

export const enqueue = (item: TikTokComment): boolean => {
  if (queue.length >= maxSize) {
    logger.info("QUEUE: queue is full");
    return false;
  }

  queue.push(item);
  emitQueueUpdate();
  logger.queue(`Added: | "${item.content}" |`);
  return true;
};

export const dequeue = () => {
  const removed = queue.shift();
  emitQueueUpdate();
  return removed;
};

export const deleteComment = (i: number) => {
  if (i < 0 || i >= queue.length) return false;
  const [deleted] = queue.splice(i, 1);
  logger.queue(`Deleted: | ${deleted.user}: "${deleted.content}"`);
  emitQueueUpdate();
  return true;
};

export const size = () => queue.length;

export const clearQueue = () => {
  queue = [];
  logger.info("Queue cleared");
  emitQueueUpdate();
};

export const getQueue = () => queue;

export { queue, maxSize };

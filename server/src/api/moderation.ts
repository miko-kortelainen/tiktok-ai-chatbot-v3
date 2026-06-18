import express, { type Request, type Response } from "express";
import { updatePrompts } from "../services/gptHandler";
import { TikTokComment } from "../models/comment.type";
import { handleComment } from "../services/commentHandler";
import { logger } from "../utils/logger";
import { deleteComment } from "../services/commentQueue";

const router = express.Router();

// handle the api call of adding a test comment
router.post("/testComment", (req: Request, res: Response) => {
  const comment: TikTokComment = req.body;
  if (!comment) return res.status(400).send({ success: false, message: "All fields are required" });

  logger.info("Test comment received successfully");

  handleComment(comment);
  res.send({ success: true, message: "Test comment received successfully" });
});

// handle the api call of updating system prompts
router.post("/updatePrompts", (req: Request, res: Response) => {
  const { defaultPrompt, followerPrompt, friendPrompt } = req.body;

  logger.info(
    `Received updated prompts:\n
    Default: ${defaultPrompt}\n
    Follower: ${followerPrompt}\n
    Friend: ${friendPrompt}`,
  );

  updatePrompts(defaultPrompt, followerPrompt, friendPrompt);
  res.send({ success: true, message: "Prompts updated successfully" });
});

// handle the api call of removing a comment from the queue
router.delete("/comment/:index", (req: Request, res: Response) => {
  const index = parseInt(req.params.index as string, 10);
  if (Number.isNaN(index)) return res.status(400).send();

  const success = deleteComment(index);
  if (!success) return res.status(400).send();
  res.status(204).send();
});

export default router;

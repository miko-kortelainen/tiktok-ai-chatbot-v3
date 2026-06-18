import express, { type Request, type Response } from "express";
import { CommentDeletionRequestSchema, CommentRequestSchema } from "@tiktok-ai-chatbot/shared/comment";
import { updatePrompts } from "../services/gptHandler";
import { handleComment } from "../services/commentHandler";
import { logger } from "../utils/logger";
import { deleteComment } from "../services/commentQueue";
import { PromptRequestSchema } from "@tiktok-ai-chatbot/shared";

const router = express.Router();

// handle the api call of adding a test comment
router.post("/comment/", (req: Request, res: Response) => {
  const result = CommentRequestSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send();

  logger.info("Test comment received successfully");

  handleComment(result.data);
  res.status(200).send();
});

// handle the api call of updating system prompts
router.post("/prompts", (req: Request, res: Response) => {
  const result = PromptRequestSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send();

  updatePrompts(result.data);
  res.send({ success: true, message: "Prompts updated successfully" });
});

// handle the api call of removing a comment from the queue
router.delete("/comment/:index", (req: Request, res: Response) => {
  const result = CommentDeletionRequestSchema.safeParse(req.params.index);
  if (!result.success) return res.status(400).send();

  const success = deleteComment(result.data.index);
  if (!success) return res.status(400).send();
  res.status(204).send();
});

export default router;

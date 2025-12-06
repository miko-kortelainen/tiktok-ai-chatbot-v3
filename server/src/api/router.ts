import express, { type Request, type Response } from "express";
import { handleAudioRequest } from "../ttsHandler";
import { handleTestComment } from "../commentHandler";
import { handleUsername } from "../tiktokHandler";
import { logger } from "../utils/logger";
import { deleteComment } from "../commentQueue";
import { updatePrompts } from "../gptHandler";

const router = express.Router();
router.use(express.json());

router.get("/version", (_req: Request, res: Response) => {
  res.send({ version: "1.0.0" });
});

router.post("/audio", handleAudioRequest);

// Function to handle the api calls of removing a comment from the queue
router.delete("/deleteComment", (req: Request, res: Response) => {
  const { index } = req.body;
  if (index === undefined) return res.status(400).send({ success: false, message: "Index is required" });
  const success = deleteComment(index);
  if (!success) return res.status(400).send({ success: false, message: "Failed to delete comment" });
  res.send({ success: true, message: "Comment deleted successfully" });
});

// function to handle the incoming username from the client
router.post("/username", (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).send({ success: false, message: "Username is required" });
  logger.info(`Trying connection to LIVE by: ${username}`);
  handleUsername(username);
  res.json({ success: true, message: "Username received successfully" });
});

// function to handle the api calls of adding a test comment
router.post("/testComment", (req: Request, res: Response) => {
  const { user, comment, followRole } = req.body;
  if (!user || !comment || followRole === undefined)
    return res.status(400).send({ success: false, message: "All fields are required" });
  logger.info("Test comment received successfully");

  handleTestComment(user, comment, followRole);
  res.send({ success: true, message: "Test comment received successfully" });
});

router.post("/updatePrompts", (req: Request, res: Response) => {
  const { defaultPrompt, followerPrompt, friendPrompt } = req.body;

  if (!defaultPrompt || !followerPrompt || !friendPrompt)
    return res.status(400).send({ success: false, message: "All prompts are required" });
  logger.info("Received updated prompts:");
  logger.info(`Default: ${defaultPrompt}`);
  logger.info(`Follower: ${followerPrompt}`);
  logger.info(`Friend: ${friendPrompt}`);

  updatePrompts(defaultPrompt, followerPrompt, friendPrompt);
  res.send({ success: true, message: "Prompts updated successfully" });
});

export default router;

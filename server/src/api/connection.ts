import express, { type Request, type Response } from "express";
import { handleTikTokDisconnect, handleUsername } from "../services/tiktokHandler";
import { logger } from "../utils/logger";
import { ConnectionRequestSchema } from "@tiktok-ai-chatbot/shared";

const router = express.Router();

// POST: /api/start-connection/:username
// recieves the tiktok username and begins the connection
router.post("/start-connection/:username", (req: Request, res: Response) => {
  const result = ConnectionRequestSchema.safeParse(req.params.username);
  if (!result.success) {
    return res.status(400).send();
  }

  logger.info(`Trying connection to LIVE by: ${result.data.username}`);

  handleUsername(result.data.username);
  res.status(200).send();
});

// DELETE: /api/stop-connection/
// disconnects from the tiktok live
router.delete("/stop-connection", async (_req: Request, res: Response) => {
  const success = await handleTikTokDisconnect();
  if (success) return res.status(204).send();
  res.status(500).send();
});

export default router;

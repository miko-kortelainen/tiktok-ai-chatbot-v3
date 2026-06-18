import express, { type Request, type Response } from "express";
import { handleUsername } from "../services/tiktokHandler";
import { logger } from "../utils/logger";

const router = express.Router();

// POST: /api/start-connection/:username
// recieves the tiktok username and begins the connection
router.post("/start-connection/:username", (req: Request, res: Response) => {
  const username = req.params.username as string;
  if (!username) {
    return res.status(400).send();
  }

  logger.info(`Trying connection to LIVE by: ${username}`);

  handleUsername(username);
  res.status(200).send();
});

export default router;

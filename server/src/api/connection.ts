import express, { type Request, type Response } from "express";
import { handleUsername } from "../services/tiktokHandler";
import { logger } from "../utils/logger";

const router = express.Router();

// handle the incoming tiktok username from the client
router.post("/username", (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).send({ success: false, message: "Username is required" });
  logger.info(`Trying connection to LIVE by: ${username}`);
  handleUsername(username);
  res.json({ success: true, message: "Username received successfully" });
});

export default router;

import express, { type Request, type Response } from "express";
import moderationRouter from "./moderation";
import connectionRouter from "./connection";

const router = express.Router();
router.use(express.json());

// version and healthcheck
router.get("/version", (_req: Request, res: Response) => {
  res.send({ version: "1.0.0" });
});

// routes
router.use(moderationRouter);
router.use(connectionRouter);

export default router;

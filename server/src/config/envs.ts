import { logger } from "../utils/logger";

export const config = {
  port: process.env.PORT || 3001,
  tiktokSessionId: process.env.TIKTOK_SESSION_ID,
  ttTargetIdc: process.env.TIKTOK_TARGET_IDC,
  openAiApiKey: process.env.OPENAI_API_KEY,
};

logger.info("Environment variables loaded.");

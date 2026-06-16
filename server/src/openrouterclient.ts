import { OpenRouter } from "@openrouter/sdk";
import { config } from "./config/config";
export const openRouterClient = new OpenRouter({
  apiKey: config.openAiApiKey,
});

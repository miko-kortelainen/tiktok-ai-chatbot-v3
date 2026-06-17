import { OpenRouter } from "@openrouter/sdk";
import { config } from "./envs";

// model used for the text response (from openrouter)
export const TEXT_MODEL: string = "openai/gpt-oss-120b";

// model and voice used for the text-to-speech (from openrouter)
export const TTS_MODEL: string = "hexgrad/kokoro-82m";
export const TTS_VOICE: string = "ff_siwis";

export const openRouterClient = new OpenRouter({
  apiKey: config.openAiApiKey,
});

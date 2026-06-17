import { openRouterClient, TTS_MODEL, TTS_VOICE } from "../config/openRouterClient";
import { logger } from "../utils/logger";

// Generate TTS audio from text and return it as a base64-encoded string
export async function generateTextToSpeech(text: string): Promise<string> {
  logger.info("Calling OpenRouter TTS API...");

  let stream;
  try {
    stream = await openRouterClient.tts.createSpeech({
      speechRequest: {
        model: TTS_MODEL,
        voice: TTS_VOICE,
        responseFormat: "mp3",
        input: text,
      },
    });
    logger.info("TTS API call successful, received stream");
  } catch (apiError) {
    logger.error("TTS API call failed:", apiError);
    throw new Error(`TTS API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }

  if (!stream) {
    throw new Error("TTS API returned null/undefined stream");
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  logger.info("Reading stream chunks...");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  logger.info(`Read ${chunks.length} chunks from stream`);

  if (chunks.length === 0) {
    throw new Error("TTS API returned empty stream - no audio data received");
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  logger.info(`Total audio data size: ${totalLength} bytes`);

  if (totalLength === 0) {
    throw new Error("TTS stream chunks have zero total length");
  }

  const buffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert the audio buffer to a base64 string for socket transfer
  const base64Audio = Buffer.from(buffer).toString("base64");
  logger.info(`Audio converted to base64 (${base64Audio.length} chars)`);
  return base64Audio;
}

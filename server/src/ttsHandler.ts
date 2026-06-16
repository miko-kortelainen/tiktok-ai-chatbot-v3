import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { openRouterClient } from "./openrouterclient";

// endpoint /audio
export async function handleAudioRequest(req: Request, res: Response) {
  try {
    const { text } = req.body;
    if (!text) {
      console.error("No text provided in request body");
      return res.status(400).send("Text parameter is required.");
    }

    console.log("Received text for TTS:", text);

    const audioFilePath = await generateTextToSpeech(text); // Generate the TTS file
    await streamSpeechFile(res, audioFilePath); // Stream the TTS file to the client
  } catch (err) {
    console.error("Error in handleAudioRequest:", err);
    handleError(res, err);
  }
}

// api call to openai to generate tts
async function generateTextToSpeech(text: string): Promise<string> {
  const filePath = path.resolve(`./speech_${Date.now()}_${Math.random()}.mp3`);

  console.log("Calling OpenRouter TTS API...");

  let stream;
  try {
    stream = await openRouterClient.tts.createSpeech({
      speechRequest: {
        model: "hexgrad/kokoro-82m",
        input: text,
        voice: "ff_siwis",
        responseFormat: "mp3",
      },
    });
    console.log("TTS API call successful, received stream");
  } catch (apiError) {
    console.error("TTS API call failed:", apiError);
    throw new Error(`TTS API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }

  if (!stream) {
    throw new Error("TTS API returned null/undefined stream");
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  console.log("Reading stream chunks...");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  console.log(`Read ${chunks.length} chunks from stream`);

  if (chunks.length === 0) {
    throw new Error("TTS API returned empty stream - no audio data received");
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  console.log(`Total audio data size: ${totalLength} bytes`);

  if (totalLength === 0) {
    throw new Error("TTS stream chunks have zero total length");
  }

  const buffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  await fs.promises.writeFile(filePath, buffer);
  console.log(`Audio file written to: ${filePath}`);
  return filePath;
}

// Function to stream the TTS file to the client
async function streamSpeechFile(res: Response, filePath: string) {
  res.writeHead(200, { "Content-Type": "audio/mpeg" });
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on("end", async () => {
    console.log("TTS done streaming.");
    await fs.promises.unlink(filePath);
  });

  fileStream.on("error", (err) => {
    console.error("Error streaming the file:", err);
    res.end();
  });
}

// Function to handle errors
function handleError(res: Response, error: any) {
  console.error("Error in handleAudioRequest:", error);
  if (!res.headersSent) {
    res.sendStatus(500);
  }
}

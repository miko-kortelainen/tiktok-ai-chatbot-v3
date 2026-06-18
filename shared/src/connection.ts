import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ConnectionRequestSchema = z
  .object({
    username: z.string().min(4).openapi({
      description: "TikTok username of the live host",
      example: "user9381",
    }),
  })
  .openapi("PromptRequest");

export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;

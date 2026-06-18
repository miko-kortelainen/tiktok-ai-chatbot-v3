import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const PromptRequestSchema = z
  .object({
    defaultPrompt: z.string().min(1).nullable().openapi({
      description: "Prompt if follower role is neither follower or a friend",
    }),
    followerPrompt: z.string().min(1).nullable().openapi({
      description: "Prompt if users follower role: follower",
    }),
    friendPrompt: z.string().min(1).nullable().openapi({
      description: "Prompt if users follower role: friend",
    }),
  })
  .openapi("PromptRequest");

export type PromptRequest = z.infer<typeof PromptRequestSchema>;

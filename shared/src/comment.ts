import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CommentRequestSchema = z
  .object({
    user: z.string().min(1).openapi({
      description: "TikTok display name for the commenter.",
      example: "miko",
    }),
    content: z.string().min(1).max(500).openapi({
      description: "Raw comment text to moderate or process.",
      example: "Can you explain how this works?",
    }),
    followRole: z.string().min(1).openapi({
      description: "Relationship of the commenter to the host.",
      example: "follower",
    }),
  })
  .openapi("CommentRequest");

export const CommentDeletionRequestSchema = z
  .object({
    index: z.number().openapi({
      description: "Index of the deleted comment",
      example: "1",
    }),
  })
  .openapi("CommentDeletionRequest");

export type CommentRequest = z.infer<typeof CommentRequestSchema>;

export type CommentDeletionRequest = z.infer<typeof CommentDeletionRequestSchema>;

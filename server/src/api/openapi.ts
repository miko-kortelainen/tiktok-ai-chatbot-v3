import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { CommentRequestSchema } from "@tiktok-ai-chatbot/shared/comment";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.register("CommentRequest", CommentRequestSchema);

const ApiMessageSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Test comment received successfully" }),
});

registry.registerPath({
  method: "post",
  path: "/api/testComment",
  summary: "Submit a test TikTok comment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CommentRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Comment accepted.",
      content: {
        "application/json": {
          schema: ApiMessageSchema,
        },
      },
    },
    400: {
      description: "Invalid request body.",
      content: {
        "application/json": {
          schema: ApiMessageSchema,
        },
      },
    },
  },
});

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: {
    title: "TikTok AI Chatbot API",
    version: "1.0.0",
  },
});

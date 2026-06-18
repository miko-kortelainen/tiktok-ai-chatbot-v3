import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { CommentDeletionRequestSchema, CommentRequestSchema } from "@tiktok-ai-chatbot/shared/comment";
import { PromptRequestSchema } from "@tiktok-ai-chatbot/shared";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/comment/",
  summary: "Submit a new comment to the queue",
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
    },
    400: {
      description: "Invalid request body.",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/prompts/",
  summary: "Update system prompts",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PromptRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Prompts updated.",
    },
    400: {
      description: "Invalid request body.",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/comment/",
  summary: "Delete a comment from the queue",
  request: {
    params: CommentDeletionRequestSchema,
  },
  responses: {
    204: {
      description: "Prompts updated.",
    },
    400: {
      description: "Invalid request body.",
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

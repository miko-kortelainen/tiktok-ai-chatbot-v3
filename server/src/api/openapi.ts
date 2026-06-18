import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { CommentDeletionRequestSchema, CommentRequestSchema } from "@tiktok-ai-chatbot/shared/comment";
import { ConnectionRequestSchema, PromptRequestSchema } from "@tiktok-ai-chatbot/shared";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/comment/",
  summary: "Submit a new comment to the queue",
  tags: ["moderation"],
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
  summary: "Update system prompts used by the AI",
  tags: ["moderation"],
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
  tags: ["moderation"],
  summary: "Delete a comment from the queue",
  request: {
    params: CommentDeletionRequestSchema,
  },
  responses: {
    204: {
      description: "Comment deleted.",
    },
    400: {
      description: "Invalid request body.",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/start-connection/",
  tags: ["connection handling"],
  summary: "Start the connection to the live",
  request: {
    params: ConnectionRequestSchema,
  },
  responses: {
    204: {
      description: "Disconnected from the live",
    },
    400: {
      description: "Invalid request body.",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/stop-connection/",
  summary: "Disconnect from the tiktok livestream",
  tags: ["connection handling"],
  responses: {
    204: {
      description: "Disconnected from the live",
    },
    500: {
      description: "Internal server error whilst trying to disconnect.",
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

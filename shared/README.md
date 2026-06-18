# Shared API Schemas

This package is the single source of truth for API payload shapes.

## Add A Schema

Create one small file per API shape:

```ts
// shared/src/comment.ts
export const CommentRequestSchema = z.object({ ... }).openapi("CommentRequest");
export type CommentRequest = z.infer<typeof CommentRequestSchema>;
```

Export it from `shared/src/index.ts` when the frontend needs the type.

## Backend Use

The server imports schemas as runtime code and validates trust boundaries:

```ts
import { CommentRequestSchema } from "@tiktok-ai-chatbot/shared/comment";

const result = CommentRequestSchema.safeParse(req.body);
if (!result.success) return res.status(400).send({ success: false });
```

Register the same schema in `server/src/api/openapi.ts` so `/docs` stays current.

## Frontend Use

The client should import only types from this package:

```ts
import type { CommentRequest } from "@tiktok-ai-chatbot/shared";
```

Do not import Zod schemas in client components unless runtime browser validation is explicitly needed.

## Workflow

Run installs from the repo root:

```bash
cd /home/miko/projects/tiktok-ai-chatbot-v3
pnpm install
```

Avoid running `pnpm install` inside `client/` or `server/`; this repo is now a root workspace.

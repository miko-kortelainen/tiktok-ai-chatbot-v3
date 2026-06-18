FROM node:24-slim AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
ENV CI=true

RUN pnpm install --frozen-lockfile

WORKDIR /app
COPY client ./client
COPY server ./server
COPY shared ./shared

RUN pnpm --filter tiktok-ai-chatbot-frontend build
RUN pnpm --filter tiktok-ai-chatbot-backend build

FROM node:24-slim AS runner
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

ENV NODE_ENV=production
ENV CI=true

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./dist/client
COPY --from=builder /app/shared ./shared

EXPOSE 3001

CMD ["node", "dist/server.js"]

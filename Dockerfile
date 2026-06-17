FROM node:24-slim AS builder
WORKDIR /app

RUN corepack enable

COPY client/package.json client/pnpm-lock.yaml ./client/
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./server/
ENV CI=true

# install backend deps
WORKDIR /app/server
RUN pnpm i --frozen-lockfile

# install frontend deps
WORKDIR /app/client
RUN pnpm i --frozen-lockfile

WORKDIR /app
COPY client ./client
COPY server ./server

RUN cd client && pnpm run build
RUN cd server && pnpm run build

FROM node:24-slim AS runner
WORKDIR /app

RUN corepack enable

COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./server/

ENV NODE_ENV=production
ENV CI=true

WORKDIR /app/server
RUN pnpm i --prod --frozen-lockfile

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./dist/client

EXPOSE 3001

CMD ["node", "dist/server.js"]
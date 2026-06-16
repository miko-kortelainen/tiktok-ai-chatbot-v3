# backend/Dockerfile
FROM node:24 AS frontend
WORKDIR /app
COPY ../client ./
RUN pnpm ci && pnpm run build

FROM node:24 AS backend
WORKDIR /app
COPY server/package.json ./
COPY server/pnpm-lock.yaml ./
RUN pnpm ci
COPY server ./
RUN npm run build
COPY --from=frontend /app/dist ./dist/client
CMD ["node", "dist/index.js"]

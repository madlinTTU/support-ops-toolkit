# One image with the API and the built React page.

FROM node:24-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM node:24-alpine AS backend
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend ./
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    FRONTEND_DIR=/app/public \
    SEED_ON_START=true
COPY --from=backend /app/package.json ./
COPY --from=backend /app/node_modules ./node_modules
COPY --from=backend /app/dist ./dist
COPY --from=backend /app/migrations ./migrations
COPY --from=frontend /app/dist ./public
EXPOSE 3000
CMD ["sh", "-c", "node node_modules/node-pg-migrate/bin/node-pg-migrate.js up && exec node dist/main"]

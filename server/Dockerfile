# ──────────────────────────────────────────────────────────────
# Stage: dev  (hot-reload via tsx watch)
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npx", "tsx", "watch", "src/index.ts"]

# ──────────────────────────────────────────────────────────────
# Stage: build  (compile TypeScript → dist/)
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx tsc --project tsconfig.json

# ──────────────────────────────────────────────────────────────
# Stage: prod  (minimal runtime image)
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/data ./src/data
EXPOSE 3001
CMD ["node", "dist/index.js"]

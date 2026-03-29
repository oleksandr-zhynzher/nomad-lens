FROM node:22-alpine AS base
WORKDIR /app

# ── Dev stage ──────────────────────────────────────────────────────────────────
FROM base AS dev
COPY .npmrc package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Build stage ────────────────────────────────────────────────────────────────
FROM base AS build
COPY .npmrc package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

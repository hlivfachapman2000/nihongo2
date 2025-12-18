# Multi-stage build for Cloud Run
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["node", "server/index.js"]

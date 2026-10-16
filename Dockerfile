# Multi-stage production Dockerfile for ClarifyAll.com
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json bun.lock* ./
RUN npm ci || npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/database ./database

# Install tsx globally or run with node loader
RUN npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]

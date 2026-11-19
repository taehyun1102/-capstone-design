
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 5000

CMD ["node", "index.js"]

# Build
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Final
FROM node:22-slim

WORKDIR /app

# Install tini for proper signal handling
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

# Copy only production node_modules and app files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/. ./

ENV NODE_ENV=production

EXPOSE 8080
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]

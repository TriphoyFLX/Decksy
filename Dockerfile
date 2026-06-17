# Multi-stage Dockerfile for high performance and minimal image size

# --- BUILD STAGE ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma client and build the production bundles
RUN npx prisma generate
RUN npm run build

# --- RUN STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built bundles, prisma, and runtime package configs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Script to apply database migrations and start the server
CMD ["sh", "-c", "npx prisma db push && npm run start"]

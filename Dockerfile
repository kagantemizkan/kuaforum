# Multi-stage build for NestJS Backend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm i --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
# Install openssl-dev and core openssl for building and generation
# openssl-dev is often needed for compilation, and core openssl for runtime
# We'll rely on the default OpenSSL provided by Alpine here (likely 3.x)
RUN apk add --no-cache openssl openssl-dev

# Copy package files and install all dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm i

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application # FIXME: Remove legacy-peer-deps
RUN npm run build --legacy-peer-deps || true

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install only the core `openssl` package for runtime
# Alpine's default `openssl` package will include the necessary runtime libraries (likely for OpenSSL 3.x).
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
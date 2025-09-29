# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) to compile TypeScript
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application (compiles TypeScript to /dist)
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:18-alpine

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install only production dependencies in final image
RUN npm ci --omit=dev

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your app listens on
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]

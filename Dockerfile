# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json for dependency installation
COPY package.json ./

# Install dependencies (no npm version override)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy all other files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.1

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Expose the port (optional, for documentation; Render overrides this)
EXPOSE 10000

# Start the app using the $PORT environment variable
CMD ["serve", "-s", "build", "-l", "$PORT"]

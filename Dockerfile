# Stage 1: Build
FROM node:18-alpine AS builder

# Install dependencies first for better caching
WORKDIR /app

# Copy only package.json first
COPY package.json ./

# Install specific npm version and dependencies
RUN npm install -g npm@9.8.1 && \
    npm install --legacy-peer-deps --no-audit

# Copy all other files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve@14.2.1
COPY --from=builder /app/build ./build
CMD ["serve", "-s", "build", "-l", "10000"]

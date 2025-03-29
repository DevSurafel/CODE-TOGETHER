# Stage 1: Build
FROM node:18-alpine AS builder

# Install dependencies first for better caching
WORKDIR /app

# Copy only package.json first
COPY package.json ./

# Install dependencies with exact versions
RUN npm install -g npm@8.19.4 && \
    npm install --legacy-peer-deps --no-audit --no-fund

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

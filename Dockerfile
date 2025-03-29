# Stage 1: Build
FROM node:18-alpine AS builder

# Install dependencies first for better caching
WORKDIR /app
COPY package.json ./
RUN npm install -g npm@8.19.4 && \
    if [ -f package-lock.json ]; then npm ci --legacy-peer-deps --no-audit; \
    else npm install --legacy-peer-deps --no-audit; fi
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve@14.2.1
COPY --from=builder /app/build ./build
CMD ["serve", "-s", "build", "-l", "10000"]

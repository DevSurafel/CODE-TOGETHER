# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@9.8.1 && \
    npm ci --legacy-peer-deps --no-audit
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve@14.2.1
COPY --from=builder /app/build ./build
CMD ["serve", "-s", "build", "-l", "10000"]

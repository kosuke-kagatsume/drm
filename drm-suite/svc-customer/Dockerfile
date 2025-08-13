FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY libs ./libs
COPY svc-customer ./svc-customer

# Build the application
RUN npm run nx build svc-customer --prod

FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/svc-customer ./
COPY --from=builder /app/node_modules ./node_modules

# Install production dependencies
RUN npm install @prisma/client

EXPOSE 3001

CMD ["node", "main.js"]
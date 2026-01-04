# Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies and built files
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist ./dist
COPY backend/devices.example.json ./devices.example.json

# Copy frontend static build
COPY --from=frontend-builder /app/frontend/out ./frontend-build

# Copy startup script
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["./docker-start.sh"]

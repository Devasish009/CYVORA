# Multi-stage Dockerfile for CYVORA Autonomous Repair Platform

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend & Integrated Static Website Server
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . ./

# Copy built frontend dist into static web serving folder
COPY --from=frontend-builder /app/frontend/dist ./apps/frontend/dist

# Expose HTTP Port
EXPOSE 8000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV CYVORA_ALLOW_DEV_AUTH=true

# Start Uvicorn Server
CMD ["python", "-m", "uvicorn", "apps.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

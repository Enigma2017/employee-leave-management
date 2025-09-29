# --- Stage 1: Build frontend ---
FROM node:22.14.0-alpine AS frontend-build

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Backend image ---
FROM node:22.14.0-alpine

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy frontend build from previous stage
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Install PostgreSQL client for initialization
RUN apk add --no-cache postgresql-client bash

# Copy SQL initialization script
COPY init.sql /app/init.sql

# Run backend tests
RUN npm run test

# Expose backend port
EXPOSE 3000

# Use JSON array for CMD to properly handle signals
CMD ["sh", "-c", "until pg_isready -h $DB_HOST -p $DB_PORT; do echo 'Waiting for PostgreSQL...'; sleep 2; done; psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /app/init.sql; npm start"]

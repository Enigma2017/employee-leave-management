# Base Node.js
FROM node:22.14.0-alpine

WORKDIR /app

# --- Frontend ---
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./ 
RUN npm run build

# --- Backend ---
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./ 

# Copy frontend build into backend (if serving through backend)
COPY --from=0 /app/frontend/dist ../frontend/dist

# --- PostgreSQL client for database initialization ---
RUN apk add --no-cache postgresql-client bash

# Copy SQL for initialization
COPY init.sql /app/init.sql

# Run backend tests
RUN npm run test

# Backend port
EXPOSE 3000

# Command: wait for PostgreSQL, initialize the database, then start backend
CMD bash -c "\
until pg_isready -h $DB_HOST -p $DB_PORT; do echo 'Waiting for PostgreSQL...'; sleep 2; done; \
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /app/init.sql; \
npm start"

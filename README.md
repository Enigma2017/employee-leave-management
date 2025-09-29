# Employee Leave Management

## Project Overview

**Employee Leave Management** is a full-stack application for managing employee vacations.  
It consists of:

- **Backend**: Node.js + Express.js, connected to a PostgreSQL database.  
  Provides REST APIs for managing users, vacations, authentication, and access tokens.
- **Frontend**: React (Vite) application for user interface.  
  Allows users and admins to view, request, and manage vacations.

The backend enforces rules such as:

- Maximum 2 vacations per year.
- Maximum 30 total vacation days per year.
- Up to 20 paid vacation days and 10 unpaid vacation days.
- Vacation overlap prevention.
- Access token and refresh token authentication.

---

## Project Structure

```
/backend       - Node.js backend code
/frontend      - React frontend code
/init.sql      - SQL file to initialize the database with some users and vacations
/Dockerfile    - Docker configuration
```

---

## Prerequisites

- Docker
- Docker Compose (optional)
- PostgreSQL (configured via environment variables inside Docker)

Environment variables (for PostgreSQL connection):

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=2007
DB_NAME=postgres
```

---

## Setup and Running with Docker

### 1️⃣ Create Docker Network (only once)

```bash
docker network create employee-network
```

### 2️⃣ Run PostgreSQL Container

```bash
docker run -d   --name employee-leave-db   --network employee-network   -e POSTGRES_USER=postgres   -e POSTGRES_PASSWORD=2007   -e POSTGRES_DB=postgres   postgres:latest
```

### 3️⃣ Check PostgreSQL Status

```bash
docker ps
docker logs employee-leave-db
```

- Look for `database system is ready to accept connections` in logs.

### 4️⃣ Run Backend + Frontend Container

```bash
docker run -d   --name employee-leave-app   --network employee-network   -p 3000:3000   -e DB_HOST=employee-leave-db   -e DB_PORT=5432   -e DB_USER=postgres   -e DB_PASSWORD=2007   -e DB_NAME=postgres   employee-leave-management
```

> This command will:  
> - Wait for PostgreSQL to be ready  
> - Initialize the database using `init.sql`  
> - Run backend tests (`vitest`)  
> - Start the backend server  

### 5️⃣ Verify Containers

```bash
docker ps
```

- Both `employee-leave-db` and `employee-leave-app` should be `Up`.  
- Access backend at: `http://localhost:3000`

---

## Stopping Containers

- Stop only backend:

```bash
docker stop employee-leave-app
```

- Stop only database:

```bash
docker stop employee-leave-db
```

- Stop all containers:

```bash
docker stop $(docker ps -q)
```

---

## Removing Containers

```bash
docker rm -f employee-leave-app employee-leave-db
```

---

## Backend Scripts

Run inside backend container:

- `npm start` - Start backend server  
- `npm run dev` - Start backend server with `nodemon`  
- `npm run test` - Run backend tests with `vitest`  

---

## Frontend Scripts

Run inside frontend container or folder:

- `npm run dev` - Start development server  
- `npm run build` - Build production frontend  
- `npm run preview` - Preview production build  

---

## Database

The database is PostgreSQL. The Docker setup uses `init.sql` to populate:

- Multiple users with roles (admin, employee, etc.)
- Sample vacation records for testing

---

## Authentication

- **Sign In**: Returns access token and refresh token  
- **Access Token**: Short-lived, encrypted with AES-256-GCM  
- **Refresh Token**: Used to generate a new access token  

---

## API Endpoints

### Users

- `GET /api/users?role=<role>` - Get all users, filter by role  
- `POST /api/user` - Create new user  
- `PUT /api/user/:id` - Update user  
- `DELETE /api/user/:id` - Delete user  

### Vacations

- `GET /api/vacations` - List all vacations  
- `POST /api/vacations/create` - Create a vacation with validation  
- `POST /api/vacations/check` - Check vacation availability  
- `GET /api/vacations/calculate` - Calculate compensation  
- `PUT /api/vacations/:id` - Edit vacation  
- `DELETE /api/vacations/:id` - Delete vacation  

### Auth

- `POST /api/signin` - Login user  
- `GET /api/me` - Get current user (requires token)  
- `POST /api/refresh-token` - Refresh access token  

---

## Notes

- The project is fully modular; frontend and backend can be run separately.  
- The Dockerfile builds both frontend and backend in one image.  
- Backend tests run automatically before the server starts.

---

## License

ISC © Shvets K

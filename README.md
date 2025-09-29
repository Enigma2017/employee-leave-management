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
/Dockerfile   - Docker configuration
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

1. **Build Docker Image**  

```bash
docker build -t employee-leave-management .
```

2. **Run Docker Container**  

```bash
docker run -d \
  --name employee-leave-app \
  -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=2007 \
  -e DB_NAME=postgres \
  employee-leave-management
```

> This command will:  
> - Wait for PostgreSQL to be ready  
> - Initialize the database using `init.sql`  
> - Run backend tests (`vitest`)  
> - Start the backend server  

3. **Access the Application**  

- Backend API: `http://localhost:3000`  
- Frontend: served via backend (React build copied into `/frontend/dist`)

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

- `GET /users?role=<role>` - Get all users, filter by role
- `POST /user` - Create new user
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user

### Vacations

- `GET /vacations` - List all vacations
- `POST /vacations/create` - Create a vacation with validation
- `POST /vacations/check` - Check vacation availability
- `GET /vacations/calculate` - Calculate compensation
- `PUT /vacations/:id` - Edit vacation
- `DELETE /vacations/:id` - Delete vacation

### Auth

- `POST /signin` - Login user
- `GET /me` - Get current user (requires token)
- `POST /refresh-token` - Refresh access token

---

## Notes

- The project is fully modular; frontend and backend can be run separately.  
- The Dockerfile builds both frontend and backend in one image.  
- Backend tests run automatically before the server starts.

---

## License

ISC © Shvets K



# 🚀 TaskFlow — Scalable REST API + Frontend

A production-ready **REST API with JWT Authentication & Role-Based Access Control**, paired with a beautiful React frontend. Built as a full-stack task management application.

---

## 🏗 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Validation | express-validator                   |
| Security   | Helmet, express-mongo-sanitize, Rate Limiter |
| API Docs   | Swagger (OpenAPI 3.0)               |
| Frontend   | React 18 + Vite                     |
| Routing    | React Router v6                     |
| HTTP       | Axios                               |
| Deploy     | Docker + Docker Compose + Nginx     |
| Logging    | Winston                             |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/       # DB & Swagger config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, error handler, validator
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/
│   │   │   └── v1/       # Versioned API routes
│   │   ├── utils/        # Logger, AppError
│   │   └── validators/   # Input validation rules
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout, LoadingScreen
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Login, Register, Dashboard, Admin, Profile
│   │   └── services/     # API service (axios)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and navigate
git clone <your-repo> && cd project

# Copy env file
cp .env.example .env

# Start everything
docker compose up --build

# Access:
# Frontend:  http://localhost
# API:       http://localhost:5000/api/v1
# API Docs:  http://localhost:5000/api/docs
# Mongo UI:  http://localhost:8081
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env        # Edit with your MongoDB URI & JWT secret
npm install
npm run dev                 # Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env        # Set VITE_API_URL
npm install
npm run dev                 # Runs on http://localhost:3000
```

---

## 🔑 API Endpoints (v1)

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login & get JWT |
| GET | `/api/v1/auth/me` | Private | Get own profile |
| PUT | `/api/v1/auth/me` | Private | Update profile |
| PUT | `/api/v1/auth/change-password` | Private | Change password |

### Tasks
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/v1/tasks` | Private | Get tasks (own/all for admin) |
| POST | `/api/v1/tasks` | Private | Create task |
| GET | `/api/v1/tasks/:id` | Private | Get single task |
| PUT | `/api/v1/tasks/:id` | Private | Update task |
| DELETE | `/api/v1/tasks/:id` | Private | Delete task |
| GET | `/api/v1/tasks/stats` | Admin | Task statistics |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/v1/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/v1/admin/users` | Admin | All users |
| GET | `/api/v1/admin/users/:id` | Admin | Single user |
| PUT | `/api/v1/admin/users/:id` | Admin | Update role/status |
| DELETE | `/api/v1/admin/users/:id` | Admin | Delete user |

---

## 🔒 Security Features

- **Password hashing** with bcryptjs (salt rounds: 12)
- **JWT authentication** with configurable expiry
- **Role-based access control** (user / admin)
- **Rate limiting** (100 req/15min per IP)
- **MongoDB query sanitization** (prevents NoSQL injection)
- **HTTP security headers** (Helmet.js)
- **Input validation** on all endpoints (express-validator)

---

## 📊 Database Schema

### User
```
name, email (unique), password (hashed), role (user|admin), isActive
```

### Task
```
title, description, status (todo|in-progress|done), priority (low|medium|high), dueDate, user (ref)
```

---

## 📖 API Documentation

Swagger UI is available at: `http://localhost:5000/api/docs`

---

## 📈 Scalability Notes

- **API versioning** (`/api/v1/`) — easy to add v2 without breaking clients
- **Modular folder structure** — each entity has its own controller/model/route/validator
- **MongoDB indexes** on frequently queried fields
- **Docker Compose** for horizontal scaling (`docker compose up --scale backend=3`)
- **Nginx** as reverse proxy / load balancer in front of React app
- **Winston logging** with file-based log rotation
- **Environment-based configuration** — no hardcoded secrets
- **Optional Redis caching** — add a `redis` service in docker-compose.yml and integrate `ioredis` for JWT blocklist / response caching

---

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 80 | React app via Nginx |
| backend | 5000 | Express API |
| mongo | 27017 | MongoDB database |
| mongo-express | 8081 | MongoDB web UI |

---

## 🧪 Testing the API

Import the Postman collection or use Swagger UI at `/api/docs`.

Example with curl:
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Create task (with token)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"high"}'
```

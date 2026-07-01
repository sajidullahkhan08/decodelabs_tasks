# Project 1: REST API Fundamentals

**Curriculum Topic:** Stateless Express.js server serving JSON data through REST endpoints.

## What This Project Implements

- Express.js server setup with JSON middleware
- Health check endpoint (`GET /health`)
- User CRUD REST endpoints (`/api/users`)
- Structured JSON request/response patterns
- HTTP status codes (200, 201, 204, 400, 404, 409)

## Files in This Project

```
project1-rest-api/
├── index.js                    # Project entry point & route mounting
├── controllers/
│   └── userController.js       # CRUD handler functions
└── routes/
    └── userRoutes.js           # RESTful route definitions
```

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Server health check |
| GET | `/api/users` | Public | List all users |
| POST | `/api/users` | Admin* | Create user |
| GET | `/api/users/:id` | User* | Get user by ID |
| PUT | `/api/users/:id` | Admin* | Update user |
| DELETE | `/api/users/:id` | Admin* | Delete user |

\* Protected routes use middleware from **Project 3**.

## Dependencies

- **Project 2** — User model and validators for database-backed CRUD
- **Project 3** — Authentication middleware on protected routes
- **Project 4** — Rate limiting on user routes

## Key Concepts

- RESTful resource design
- Controller/route separation
- Stateless API architecture
- Proper HTTP status codes and JSON responses

# Project 3: Secure Authentication System

**Curriculum Topic:** JWT authentication, bcrypt password hashing, and protected routes.

## What This Project Implements

- User registration and login with JWT tokens
- HTTP-only secure cookies (SameSite strict)
- Password hashing via bcrypt (10 salt rounds)
- Route protection middleware (`protect`)
- Role-based authorization (`authorize`)
- Email verification guard (`verifyEmail`)

## Files in This Project

```
project3-authentication/
├── index.js                    # Project entry point & route mounting
├── controllers/
│   └── authController.js       # register, login, logout, getMe, updatePassword
├── middleware/
│   └── auth.js                 # protect, authorize, verifyEmail
└── routes/
    └── authRoutes.js           # /api/auth/* endpoints
```

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/logout` | Public | Clear JWT cookie |
| GET | `/api/auth/me` | User | Get current user profile |
| PUT | `/api/auth/updatepassword` | User | Update password |

## Also Secures

Project 3 middleware is applied to user routes in **Project 1**:

- `POST /api/users` — admin only
- `GET /api/users/:id` — authenticated users
- `PUT /api/users/:id` — admin only
- `DELETE /api/users/:id` — admin only

## Security Features

- JWT with configurable expiration (`JWT_EXPIRE`)
- HTTP-only cookies (`secure: true` in production)
- bcrypt password comparison via `matchPassword()`
- Token from `Authorization: Bearer` header or cookie
- Password reset & email verification token methods on User model

## Dependencies

- **Project 2** — User model and validators

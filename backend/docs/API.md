# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Protected routes accept JWT via:
- `Authorization: Bearer <token>` header
- `token` HTTP-only cookie (set on login/register)

---

## Health Check

### GET /health

No authentication required.

**Response `200 OK`**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-07-01T12:00:00.000Z",
  "uptime": 42
}
```

---

## Authentication Endpoints

### Register User

**POST /auth/register**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `201 Created`**
```json
{
  "success": true,
  "token": "eyJhbG...",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "..."
  }
}
```

### Login User

**POST /auth/login**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200 OK`** — Same shape as register.

### Logout

**POST /auth/logout**

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**GET /auth/me** — Requires authentication.

**Response `200 OK`**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "lastLogin": "...",
    "createdAt": "..."
  }
}
```

### Update Password

**PUT /auth/updatepassword** — Requires authentication.

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response `200 OK`** — Returns new token and user data.

---

## User Management

### Get All Users

**GET /users** — Public read access.

**Response `200 OK`**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Create User (Admin)

**POST /users** — Requires admin role.

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response `201 Created`**

### Get User by ID

**GET /users/:id** — Requires authentication.

**Response `200 OK`**

### Update User (Admin)

**PUT /users/:id** — Requires admin role.

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

**Response `200 OK`**

### Delete User (Admin)

**DELETE /users/:id** — Requires admin role.

**Response `204 No Content`**

---

## Weather API

### Get Current Weather

**GET /weather/current?city=London&country=UK** — Public.

**Response `200 OK`**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "city": "London",
    "country": "GB",
    "weather": "Clouds",
    "description": "overcast clouds",
    "icon": "04d",
    "temperature": {
      "current": 20,
      "feelsLike": 18.9,
      "min": 16.9,
      "max": 21.9
    },
    "humidity": 80,
    "wind": { "speed": 3.5, "direction": 180 },
    "sunrise": "...",
    "sunset": "...",
    "timestamp": "..."
  }
}
```

### Get Weather Forecast

**GET /weather/forecast?city=London** — Requires authentication.

**Response `200 OK`**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "city": "London",
    "country": "GB",
    "forecast": [
      {
        "date": "2026-07-01",
        "avgTemperature": 19.5,
        "avgHumidity": 75,
        "readings": [...]
      }
    ]
  }
}
```

### Get Multiple Cities Weather

**POST /weather/multiple** — Requires authentication.

```json
{
  "cities": ["London", "Paris", { "city": "Tokyo", "country": "JP" }]
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "count": 3,
  "successful": 2,
  "failed": 1,
  "data": [
    { "city": "London", "success": true, "data": {...} },
    { "city": "Invalid", "success": false, "message": "City not found" }
  ]
}
```

### Clear Weather Cache (Admin)

**GET /weather/cache/clear** — Requires admin role.

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Cleared 5 cached weather entries"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
| 504 | Gateway Timeout |

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "A valid email address is required" }
  ]
}
```

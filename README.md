# DecodeLabs Backend

A production-ready Node.js backend covering DecodeLabs Projects 1–4: REST API fundamentals, MongoDB CRUD, JWT authentication, and OpenWeatherMap integration with caching and circuit breaker patterns.

## Features

- **Project 1** — Express REST API with health checks and structured error responses
- **Project 2** — MongoDB/Mongoose CRUD with validation and indexing
- **Project 3** — JWT auth, bcrypt hashing, HTTP-only cookies, role-based access
- **Project 4** — OpenWeatherMap integration with caching, rate limiting, and circuit breaker

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Axios, Helmet, CORS, Morgan, Compression
- Jest + Supertest for testing

## Quick Start

### Prerequisites

- Node.js >= 16
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiry (days) | `7` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | — |
| `OPENWEATHER_BASE_URL` | Weather API base URL | OpenWeatherMap 2.5 |
| `WEATHER_API_TIMEOUT` | API timeout (ms) | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `CACHE_TTL` | Cache TTL (ms) | `300000` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `60` |
| `RATE_LIMIT_MAX` | Max requests per window | `60` |

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5000/health](http://localhost:5000/health) to verify.

### Seed Database

```bash
npm run seed
# Admin: admin@decodelabs.com / admin123
# Force re-seed: FORCE_SEED=true npm run seed
```

### Run Tests

```bash
npm test
```

### Production

```bash
NODE_ENV=production npm start
```

Use a process manager like [PM2](https://pm2.keymetrics.io/) for production deployments.

## Project Structure

```
backend/
├── config/db.js           # MongoDB connection
├── controllers/           # Route handlers
├── middleware/            # Auth, cache, rate limit, errors
├── models/User.js         # User schema
├── routes/                # API route definitions
├── utils/                 # Validators, circuit breaker
├── scripts/               # Seed & migrate scripts
├── tests/                 # Unit & integration tests
└── server.js              # Application entry point
```

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Public | Logout |
| GET | `/auth/me` | User | Current user |
| PUT | `/auth/updatepassword` | User | Update password |
| GET | `/users` | Public | List users |
| POST | `/users` | Admin | Create user |
| GET | `/users/:id` | User | Get user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/weather/current` | Public | Current weather |
| GET | `/weather/forecast` | User | 5-day forecast |
| POST | `/weather/multiple` | User | Multi-city weather |
| GET | `/weather/cache/clear` | Admin | Clear weather cache |

See [docs/API.md](docs/API.md) for full API documentation.

## Security

- Password hashing (bcrypt, 10 salt rounds)
- JWT with HTTP-only, SameSite strict cookies
- Helmet security headers
- CORS restricted to `CLIENT_URL`
- Rate limiting on all routes
- Input validation and sanitization
- No secrets in source code or logs

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests use `mongodb-memory-server` for isolated database testing and mock external weather API calls.

## Postman

Import `postman/DecodeLabs-Backend.postman_collection.json` into Postman for ready-to-use API requests.

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas or managed MongoDB
- [ ] Set `CLIENT_URL` to production frontend URL
- [ ] Add valid `OPENWEATHER_API_KEY`
- [ ] Enable HTTPS (secure cookies auto-enabled in production)
- [ ] Use PM2 or similar process manager
- [ ] Set up monitoring and log aggregation

## License

MIT

# Project 4: Third-Party API Integration

**Curriculum Topic:** OpenWeatherMap integration with caching, rate limiting, and circuit breaker.

## What This Project Implements

Four roles of third-party API integration:

| Role | Implementation |
|------|----------------|
| **The Vault** | API keys stored in `.env`, never hardcoded |
| **The Messenger** | Axios HTTP client with timeout configuration |
| **The Translator** | Transform raw API data (Kelvin→Celsius, filter/map/reduce) |
| **The Shield** | Error handling, circuit breaker, cache fallback |

## Files in This Project

```
project4-weather-api/
├── index.js                    # Project entry point & route mounting
├── controllers/
│   └── weatherController.js    # Weather fetch, transform, error handling
├── middleware/
│   ├── cache.js                # In-memory TTL cache
│   └── rateLimiter.js          # Public & authenticated rate limits
├── routes/
│   └── weatherRoutes.js        # /api/weather/* endpoints
└── utils/
    └── circuitBreaker.js       # Circuit breaker pattern (CLOSED/OPEN/HALF_OPEN)
```

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/weather/current` | Public | Current weather by city |
| GET | `/api/weather/forecast` | User | 5-day forecast |
| POST | `/api/weather/multiple` | User | Multi-city parallel fetch |
| GET | `/api/weather/cache/clear` | Admin | Clear weather cache |

## Environment Variables

```env
OPENWEATHER_API_KEY=your_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_TIMEOUT=5000
CACHE_TTL=300000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=60
```

## Resilience Patterns

- **Caching** — 5-minute TTL in-memory cache (configurable)
- **Circuit Breaker** — Opens after 5 failures, 60s timeout, HALF_OPEN retry
- **Rate Limiting** — 60 req/min public, 600 req/min authenticated
- **Graceful Degradation** — Returns cached data when circuit is OPEN

## Dependencies

- **Project 2** — City validation utility
- **Project 3** — Authentication for forecast/multiple endpoints

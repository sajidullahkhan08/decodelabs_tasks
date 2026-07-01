# DecodeLabs Backend

A production-ready Node.js backend with **four clearly separated curriculum projects**, each in its own module under `projects/`.

## The Four Projects

| # | Project | Folder | Key Endpoints |
|---|---------|--------|---------------|
| 1 | REST API Fundamentals | `projects/project1-rest-api/` | `/health`, `/api/users` |
| 2 | Database Integration | `projects/project2-database/` | MongoDB, models, validation |
| 3 | Secure Authentication | `projects/project3-authentication/` | `/api/auth` |
| 4 | Third-Party API Integration | `projects/project4-weather-api/` | `/api/weather` |

See **[PROJECTS.md](PROJECTS.md)** for the complete project guide, file map, and architecture diagram.

## Project Structure

```
backend/
├── projects/                          # ← All 4 curriculum projects
│   ├── index.js                       # Central project registry
│   ├── project1-rest-api/             # PROJECT 1
│   ├── project2-database/             # PROJECT 2
│   ├── project3-authentication/       # PROJECT 3
│   └── project4-weather-api/          # PROJECT 4
├── server.js                          # Composes all projects
├── scripts/                           # Seed & migrate (Project 2)
├── tests/                             # Tests organized by project
│   ├── project1/
│   ├── project2/
│   ├── project3/
│   └── project4/
├── docs/API.md
├── postman/
├── PROJECTS.md                        # Project identification guide
└── package.json
```

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, OPENWEATHER_API_KEY
npm run dev
```

Visit [http://localhost:5000/health](http://localhost:5000/health) — the response includes the project name.

On startup, the server logs all four loaded projects:

```
═══════════════════════════════════════════════════════════
  DecodeLabs Backend — All 4 Projects Loaded
═══════════════════════════════════════════════════════════
  Project 1: REST API Fundamentals  →  /health, /api/users
  Project 2: Database Integration       →  MongoDB (...)
  Project 3: Secure Authentication  →  /api/auth
  Project 4: Third-Party API Integration  →  /api/weather
═══════════════════════════════════════════════════════════
```

## Per-Project Documentation

Each project folder contains its own `README.md`:

- [Project 1 — REST API](projects/project1-rest-api/README.md)
- [Project 2 — Database](projects/project2-database/README.md)
- [Project 3 — Authentication](projects/project3-authentication/README.md)
- [Project 4 — Weather API](projects/project4-weather-api/README.md)

## API Documentation

Full API reference: [docs/API.md](docs/API.md)

Postman collection: [postman/DecodeLabs-Backend.postman_collection.json](postman/DecodeLabs-Backend.postman_collection.json)

## Scripts

```bash
npm run dev       # Development server (nodemon)
npm start         # Production server
npm test          # Run all project tests
npm run seed      # Seed database (Project 2)
npm run migrate   # Sync indexes (Project 2)
```

## Environment Variables

See `.env.example` for all required variables. Minimum required:

- `MONGODB_URI` — MongoDB connection (Project 2)
- `JWT_SECRET` — JWT signing key (Project 3)
- `OPENWEATHER_API_KEY` — Weather API key (Project 4)

## License

MIT

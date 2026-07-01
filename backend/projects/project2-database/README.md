# Project 2: Database Integration (CRUD)

**Curriculum Topic:** MongoDB with Mongoose ODM for persistent data storage and full CRUD operations.

## What This Project Implements

- MongoDB connection with Mongoose (`config/db.js`)
- User schema with validation, indexes, and hooks (`models/User.js`)
- Input validation utilities (`utils/validators.js`)
- Global error handling for Mongoose errors (`middleware/errorHandler.js`)
- Database seeding and migration scripts

## Files in This Project

```
project2-database/
├── index.js                    # Project entry point & DB initialization
├── config/
│   └── db.js                   # MongoDB connection & graceful shutdown
├── models/
│   └── User.js                 # Mongoose schema, indexes, methods
├── utils/
│   └── validators.js           # Email, password, name validation
└── middleware/
    └── errorHandler.js         # Mongoose/JWT error handling
```

## Features

- **Connection management** — connect, event listeners, graceful shutdown
- **Schema validation** — required fields, email regex, password rules
- **Indexes** — email (unique), createdAt, role, name (text search)
- **Password hashing** — bcrypt pre-save hook (used by Project 3)
- **Static methods** — `findByEmail`, `findAllSorted`, `findByRole`
- **Error handling** — ValidationError, duplicate key (11000), CastError

## Used By

- **Project 1** — User CRUD operations
- **Project 3** — User lookup for authentication
- **Project 4** — City validation for weather queries

## Scripts

```bash
npm run seed      # Seed 10-20 test users
npm run migrate   # Sync database indexes
```

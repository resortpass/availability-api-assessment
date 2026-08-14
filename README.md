# Availability API - Technical Assessment

## Overview

Build an API that provides availability information for products. The system currently supports basic products (like day passes), but now needs to integrate with a 3rd party API that provides time-slotted services (like massage appointments).


## Problem Statement

Your company offers various products at resort properties. Currently, you have simple products with daily availability (e.g., "Pool Day Pass - 10 available on 2024-03-15").

Now you want to expand to offer services from a 3rd party provider that operates on time slots (e.g., "60-min Massage - available at 10:00 AM, 2:00 PM, 4:30 PM").

**Your task:** Design and implement a flexible availability API that:
1. Handles both inventory-based products AND time-slotted services
2. Provides a consistent API response regardless of the source

## Requirements

### 1. Data Model Design

Design your database schema to support:
- **Internal products** with inventory counts (e.g., day passes, cabanas)
- **External time-slotted services** from the 3rd party API
- Should be extensible for future product types

**You must:**
- Create your own migration(s) using Knex.js

### 2. API Implementation

Implement the following endpoint:

```
GET /api/availability?productId={id}&date={YYYY-MM-DD}
```

**Response format (design your own):**
```json
{
  "productId": "...",
  "productName": "...",
  "date": "2024-03-15",
  "availability": [
    // Your design here - should work for both:
    // - inventory-based products (e.g., "10 available")
    // - time-slotted services (e.g., "available at 10:00, 14:00, 16:30")
  ]
}
```

### 3. 3rd Party Integration

A mock 3rd party API is provided in `mock-api/`:
- See `mock-api/example-response.json` for the response format
- Run `npm run mock-api` to start the mock server on `http://localhost:3001`

**Integration requirements:**
- Map 3rd party products to your internal data model
- Handle 3rd party API failures gracefully

### 4. Testing

Write tests that demonstrate:
- Availability queries for internal products work correctly
- Availability queries for 3rd party products work correctly
- Your API returns consistent responses for both types
- Error handling (3rd party API down, invalid dates, etc.)

## Getting Started

### Option 1: Docker (Recommended - No Dependencies Required!)

**Prerequisites:** Docker and Docker Compose only

```bash
# Start everything (app + mock API)
make start

# Or manually:
docker-compose up -d

# Check services are running
make check

# View logs
make logs

# Create a migration
make migrate-make NAME=create_initial_schema

# Edit the migration file in migrations/, then run:
make migrate

# Run tests
make test

# Stop everything
make stop
```

Your services will be available at:
- Main API: http://localhost:3000
- Mock API: http://localhost:3001

See `Makefile` for all available commands (`make help`).

### Option 2: Local Development (Requires Node.js 18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your database:**
   ```bash
   # Create your first migration
   npm run migrate:make create_initial_schema

   # Edit the migration file in migrations/
   # Then run it:
   npm run migrate:latest
   ```

3. **Start the mock 3rd party API:**
   ```bash
   npm run mock-api
   # Runs on http://localhost:3001
   ```

4. **Start your API:**
   ```bash
   npm run dev
   # Your API should run on http://localhost:3000
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Project Structure

```
.
├── src/
│   ├── index.ts              # Express app entry point (basic setup provided)
│   ├── routes/               # Your API routes
│   ├── services/             # Business logic
│   ├── repositories/         # Database access
│   └── types/                # TypeScript types
├── migrations/               # Knex migrations (you create these)
├── mock-api/
│   ├── server.ts             # Mock 3rd party API server
│   └── example-response.json # Sample 3rd party response
├── tests/                    # Your tests
├── knexfile.ts               # Database configuration
└── DESIGN.md                 # Document your design decisions here
```

## Evaluation Criteria

Your submission will be evaluated on:

1. **Data Model Design (35%)**
   - Flexibility and extensibility
   - Proper use of database constraints and indexes

2. **API Design (25%)**
   - Consistent, intuitive response format
   - Proper HTTP semantics
   - Error handling
   - Response time considerations

3. **Code Quality (25%)**
   - Clean, readable code
   - Proper separation of concerns
   - TypeScript usage
   - Error handling

4. **Testing (15%)**
   - Test coverage
   - Test quality and clarity
   - Edge case handling

## Tips

- Start with the data model - sketch it out on paper first
- Think about how to represent "availability" in a way that works for both inventory and time slots
- Don't over-engineer - focus on the core requirements first
- Document your assumptions in DESIGN.md

## Submission

Please provide:
1. All source code
2. `DESIGN.md` with your design decisions and tradeoffs
3. Instructions for running your solution (if different from above)
4. Any assumptions you made

## Questions?

Document any assumptions in `DESIGN.md`. In a real assessment, you would have the opportunity to ask clarifying questions.

---

**Note:** This is a technical assessment. Focus on demonstrating your ability to design extensible systems, integrate with external APIs, and write clean, maintainable code.

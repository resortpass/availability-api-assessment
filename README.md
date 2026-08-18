# Availability API — Live Coding Exercise

## Overview

This is a live pairing exercise. You'll work through it with an interviewer over about 60 minutes of hands-on time. Think out loud, ask questions, and treat your interviewer like a teammate — assumptions are fine as long as you say them out loud.

**The problem:** Your company sells products at resort properties. Today the system handles simple inventory products with a daily count (e.g., "Pool Day Pass — 35 of 50 available on 2024-03-15"). Now you're adding spa services from a 3rd-party provider that operate on time slots (e.g., "60-Minute Swedish Massage — available at 09:00, 10:00, 14:00"). Your job is to integrate the 3rd-party data and serve both product types from one consistent API.

## What's Provided

- **Database schema** — all four tables, already migrated (see below). You don't need to design the schema, but you may add migrations if your design needs them.
- **Seed data** — internal products with inventory, plus catalog rows for the spa services (see [Seeded Data](#seeded-data)).
- **A working availability endpoint** — `GET /api/availability` already serves inventory-based products.
- **A mock 3rd-party API** — the SpaBooking service, running on port 3001. Its contract is documented in [`mock-api/API.md`](mock-api/API.md).
- **Test scaffolding** — Jest + supertest are wired up, with a DB helper, passing examples, and an example of stubbing the 3rd-party HTTP API with nock.

## Database Schema

Four tables exist via the migrations in `migrations/`:

**`products`** — the product catalog (both internal products and spa services live here)

| Column | Type | Notes |
|---|---|---|
| id | increments | PK |
| external_id | string | unique — the **public** product ID (e.g. `pool-pass-001`) |
| name, description | string, text | |
| base_price, currency | decimal, string(3) | |
| active | boolean | default true |
| created_at, updated_at | timestamps | |

**`inventory`** — daily counts for inventory-based products

| Column | Type | Notes |
|---|---|---|
| id | increments | PK |
| product_id | FK → products | cascade delete |
| date | date | unique with product_id |
| total_quantity, available_quantity, reserved_quantity | integer | |
| created_at, updated_at | timestamps | |

**`product_timeslots`** — time-slot availability for slotted products

| Column | Type | Notes |
|---|---|---|
| id | increments | PK |
| product_id | FK → products | cascade delete |
| date | date | indexed |
| start_time, end_time | time | `HH:MM` |
| available | boolean | default true |
| created_at, updated_at | timestamps | |

Note there is deliberately **no** unique constraint on (product_id, date, start_time) — the same service can be offered by multiple providers at the same time.

**`product_timeslot_details`** — 1:1 extension of a timeslot row for provider-specific detail

| Column | Type | Notes |
|---|---|---|
| product_timeslot_id | FK → product_timeslots | PK, cascade delete |
| description | text | nullable |
| provider_name, provider_id | string | nullable |
| gender | string | nullable |
| external_id | string | nullable, indexed |
| created_at, updated_at | timestamps | |

One thing is **intentionally left open**: how the 3rd party's service IDs (e.g. `spa-001`) map to your `products` rows. That's a design decision for you — a constant map, a new column, a new table, whatever you think is right.

## Your Tasks

1. **Extend the availability endpoint.** `GET /api/availability?productId={id}&date={YYYY-MM-DD}` should also serve time-slotted products from `product_timeslots` (+ details), returning **one consistent response shape** for both product types. The response format is your design.
2. **Build the 3rd-party integration.** Fetch availability from the mock SpaBooking API and populate `product_timeslots` / `product_timeslot_details`. A sync endpoint, a script, or on-demand fetching — your choice. The vendor payload is noisy; map only what the schema needs and discard the rest. Decide how serviceId → product mapping works.
3. **Handle 3rd-party failures gracefully.** The mock API can simulate failures deterministically (see `mock-api/API.md`).
4. **Add tests** as you go — the scaffolding in `tests/` is there to make this cheap.

**Stretch ideas** (if there's time, or for discussion): a refresh/caching strategy for 3rd-party data, date-range queries, avoiding N+1 queries.

## Getting Started

### Option 1: Docker

```bash
make start        # start app (:3000) + mock API (:3001)
make migrate      # run migrations
make seed         # seed the database
make test         # run tests
make stop         # stop everything
```

`make help` lists everything else. If you run `docker-compose up` directly instead of `make start`, run `touch dev.sqlite3` first — Docker otherwise creates that bind mount as a directory.

### Option 2: Local (Node.js 18+)

```bash
npm install
npm run migrate:latest    # run migrations
npm run seed:run          # seed the database

npm run mock-api          # terminal 1: mock 3rd-party API on :3001
npm run dev               # terminal 2: your API on :3000

npm test                  # run tests
```

### Sanity checks

```bash
curl http://localhost:3000/health

# Seeded inventory product — works out of the box:
curl "http://localhost:3000/api/availability?productId=pool-pass-001&date=2024-03-15"

# The mock 3rd-party API:
curl "http://localhost:3001/api/availability/spa-001?date=2024-03-15"
```

## Seeded Data

Internal inventory products (with inventory rows for **2024-03-15**):

| external_id | Name | Total | Available |
|---|---|---|---|
| `pool-pass-001` | Pool Day Pass - Weekday | 50 | 35 |
| `cabana-001` | Poolside Cabana | 10 | 3 |
| `gym-pass-001` | Fitness Center Day Pass | 100 | 87 |

Spa catalog products (seeded in `products`, but with **no timeslot data yet** — populating that from the 3rd-party API is your job):

| external_id | Name |
|---|---|
| `massage-swedish-60` | 60-Minute Swedish Massage |
| `massage-deep-90` | 90-Minute Deep Tissue Massage |
| `facial-express-30` | 30-Minute Express Facial |

The mock API serves slot data for `2024-03-15` and `2024-03-16`.

## Project Structure

```
.
├── src/
│   ├── index.ts              # Express app entry point
│   ├── db.ts                 # Shared knex instance
│   ├── routes/               # API routes (availability route provided)
│   ├── services/             # Business logic
│   ├── repositories/         # Database access (product, inventory, timeslot repos provided)
│   └── types/                # TypeScript types
├── migrations/               # Knex migrations (all four tables provided)
├── seeds/                    # Seed data
├── mock-api/
│   ├── server.ts             # Mock 3rd-party SpaBooking API
│   ├── API.md                # Its API contract — read this
│   └── example-response.json # Sample payload
├── tests/                    # Jest + supertest scaffolding
└── DESIGN.md                 # Jot your decisions here as you go
```

## Testing

```bash
npm test          # or: make test
```

Tests run against an in-memory SQLite database that is migrated and seeded by `tests/helpers/db.ts`. Look at the existing examples for hitting the API with supertest and for stubbing the 3rd-party API with nock.

## Common Issues

**Port already in use?** Start on another port: `PORT=3002 npm run dev`. (The mock API is pinned to 3001.)

**Migration fails?** `npm run migrate:rollback`, fix, then `npm run migrate:latest`.

**Mock API not responding?** Make sure `npm run mock-api` is running — you should see it listening on http://localhost:3001.

**TypeScript errors?** `npm test` type-checks everything it touches via ts-jest, and your editor's TypeScript server will flag issues as you edit. (`npm run build` isn't used in this exercise.)

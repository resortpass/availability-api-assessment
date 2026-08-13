# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup

```bash
# 1. Clone (or download) this repository
git clone <repository-url>
cd availability-api-assessment

# 2. Install dependencies
npm install

# 3. Start the mock 3rd party API (in one terminal)
npm run mock-api

# 4. In another terminal, start your development server
npm run dev

# 5. Test the health check
curl http://localhost:3000/health
```

## What You Need to Do

### Step 1: Design Your Database Schema (60-90 mins)

Read `SAMPLE_DATA.md` to understand the two product types you need to support.

Create a migration:
```bash
npm run migrate:make create_your_schema_name
```

Edit the file in `migrations/` and implement your schema.

Run it:
```bash
npm run migrate:latest
```

Document your design decisions in `DESIGN.md`.

### Step 2: Implement the API (90-120 mins)

Implement: `GET /api/availability?productId={id}&date={YYYY-MM-DD}`

You'll need to:
- Create routes in `src/routes/`
- Create services in `src/services/`
- Create repositories in `src/repositories/`
- Define types in `src/types/`

Wire everything up in `src/index.ts`.

### Step 3: Integrate with 3rd Party API (60-90 mins)

The mock API runs at `http://localhost:3001`.

Try it:
```bash
curl http://localhost:3001/api/availability/spa-001?date=2024-03-15
```

Create an adapter/client to:
- Fetch availability from the mock API
- Map it to your internal data model
- Handle failures gracefully

### Step 4: Write Tests (60 mins)

Write tests in `tests/` that verify:
- Internal products return correct availability
- External products return correct availability
- Error cases are handled properly
- Response format is consistent

Run tests:
```bash
npm test
```

### Step 5: Document Your Decisions (30 mins)

Complete `DESIGN.md` with:
- Your schema design and why
- Your API response format and why
- How you handle 3rd party integration
- Tradeoffs and future improvements

## Testing Your Work

### Manual Testing

```bash
# Test health check
curl http://localhost:3000/health

# Test your availability endpoint (after implementing it)
curl http://localhost:3000/api/availability?productId=YOUR_PRODUCT_ID&date=2024-03-15

# Test the mock 3rd party API
curl http://localhost:3001/api/availability/spa-001?date=2024-03-15
```

### Automated Testing

```bash
npm test
```

## Common Issues

**Port already in use?**
```bash
# Change PORT in .env or:
PORT=3001 npm run dev
```

**Migration fails?**
```bash
# Rollback and try again:
npm run migrate:rollback
# Fix your migration file
npm run migrate:latest
```

**Mock API not responding?**
```bash
# Make sure it's running:
npm run mock-api
# Should see: "🧖 Mock SPA API running on http://localhost:3001"
```

**TypeScript errors?**
```bash
# Check your types and imports
npm run build
```

## Submission Checklist

Before submitting, make sure you have:

- [ ] Created database migrations
- [ ] Implemented the availability API endpoint
- [ ] Integrated with the mock 3rd party API
- [ ] Written tests (with passing test suite)
- [ ] Completed `DESIGN.md` with your decisions
- [ ] Code runs successfully with `npm run dev`
- [ ] Tests pass with `npm test`
- [ ] No hardcoded values (use environment variables)

## Time Management

Suggested breakdown for a 4-6 hour assessment:

- **30 mins**: Read requirements, understand mock API, plan approach
- **60-90 mins**: Design and implement database schema
- **90-120 mins**: Implement API and business logic
- **60-90 mins**: 3rd party integration
- **60 mins**: Write tests
- **30 mins**: Documentation and cleanup

If you're running short on time:
1. Prioritize a working data model and API
2. Get at least basic tests working
3. Document what you would do differently with more time in `DESIGN.md`

## Need Help?

- Check `SAMPLE_DATA.md` for examples of what you need to support
- Check `HINTS.md` if you're stuck (but try on your own first!)
- The mock API code in `mock-api/server.ts` shows the 3rd party API contract

## Questions?

Document any assumptions or questions in `DESIGN.md`. In a real assessment, you'd have the opportunity to ask clarifying questions.

Good luck! 🚀

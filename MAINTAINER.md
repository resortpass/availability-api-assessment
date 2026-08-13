# Maintainer Guide

This guide is for hiring managers and interviewers using this assessment.

## Quick Overview

This is a 4-6 hour take-home technical assessment that evaluates:
- **Data modeling** - Can they design flexible, extensible schemas?
- **API design** - Can they create consistent, intuitive interfaces?
- **Integration** - Can they abstract away 3rd party details?
- **Code quality** - Is their code clean, typed, and well-organized?
- **Testing** - Do they write meaningful tests?

## What Candidates Need to Do

1. Design a database schema that supports both inventory-based products AND time-slotted services from a 3rd party API
2. Implement `GET /api/availability?productId={id}&date={date}` with a consistent response format
3. Integrate with a mock 3rd party SPA booking API (provided)
4. Write tests
5. Document their design decisions

The key challenge: their data model must NOT leak 3rd party API specifics while still supporting both product types elegantly.

## Sending to Candidates

### Option 1: GitHub Repository (Recommended)

1. Fork or copy this repository to a private repo
2. Give the candidate read access
3. Ask them to clone and submit their solution as a zip file or private fork

### Option 2: Zip File

```bash
cd /path/to/availability-api-assessment
git archive --format=zip --output=availability-assessment.zip HEAD
```

Send them the zip file.

## Evaluation Process

### Step 1: Does It Run? (5 mins)

```bash
cd candidate-submission
make start
# Or: docker-compose up -d

# Check if services are up
curl http://localhost:3000/health

# Try their API
curl "http://localhost:3000/api/availability?productId=SOME_ID&date=2024-03-15"

# Run their tests
make test
```

If it doesn't run or tests fail, note it but continue reviewing.

### Step 2: Review the Data Model (15-20 mins)

Open their migration files in `migrations/`.

**Look for:**
- ✅ Clean separation between product catalog and availability
- ✅ Flexible design that can handle new product types
- ✅ No fields like `spa_therapist_id` or `3rd_party_slot_data` leaking into core tables
- ✅ Proper foreign keys, indexes, and constraints
- ✅ Reasonable normalization (not over or under-normalized)

**Red flags:**
- ❌ Tightly coupled to the 3rd party API structure
- ❌ Separate tables for each product type (not extensible)
- ❌ No foreign keys or constraints
- ❌ Missing indexes on query columns

### Step 3: Review the API Design (10-15 mins)

Check their API response format.

**Look for:**
- ✅ Consistent format for both product types
- ✅ Clients can consume both types without knowing the source
- ✅ Proper HTTP status codes
- ✅ Graceful error handling
- ✅ Reasonable performance (no obvious N+1 queries)

**Red flags:**
- ❌ Different response shapes for different product types
- ❌ Exposing internal IDs like `spa-001` from the 3rd party
- ❌ Poor error messages or wrong status codes
- ❌ No error handling for 3rd party failures

### Step 4: Review Code Quality (15-20 mins)

Look at `src/` directory structure.

**Look for:**
- ✅ Clear separation of concerns (routes/services/repositories)
- ✅ Strong TypeScript typing
- ✅ Readable, self-documenting code
- ✅ Adapter/client pattern for 3rd party integration
- ✅ Configuration not hardcoded

**Red flags:**
- ❌ Everything in one file
- ❌ Heavy use of `any` types
- ❌ Poor naming or unclear logic
- ❌ Direct 3rd party API calls mixed with business logic

### Step 5: Review Tests (10 mins)

Check `tests/` directory.

**Look for:**
- ✅ Tests for both product types
- ✅ Error case testing
- ✅ Clear test names and structure
- ✅ Meaningful assertions

**Red flags:**
- ❌ No tests or minimal tests
- ❌ Only happy path testing
- ❌ Tests that don't actually verify behavior

### Step 6: Review Documentation (5-10 mins)

Read their `DESIGN.md`.

**Look for:**
- ✅ Clear explanation of design decisions
- ✅ Discussion of tradeoffs
- ✅ Awareness of scalability/performance considerations
- ✅ What they would improve with more time

**Red flags:**
- ❌ No documentation or minimal documentation
- ❌ No discussion of tradeoffs

## Scoring

Use the detailed rubric in `EVALUATION_RUBRIC.md`.

**Quick scoring:**
- **90-100**: Exceptional - hire immediately
- **80-89**: Strong - solid candidate
- **70-79**: Good - promising
- **60-69**: Adequate - meets minimum bar
- **Below 60**: Needs improvement

## Common Patterns in Good Submissions

### Data Model Approach 1: Product Type Enum
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'timeslot')),
  source TEXT NOT NULL CHECK (source IN ('internal', 'external_spa')),
  external_id TEXT, -- Maps to spa-001, spa-002, etc.
  ...
);

CREATE TABLE availability_slots (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  date DATE NOT NULL,
  time_slot TIME,
  quantity INTEGER,
  available BOOLEAN,
  ...
);
```

### Data Model Approach 2: Polymorphic Availability
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  provider_config JSONB, -- Store source-specific details
  ...
);

CREATE TABLE availability (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  date DATE NOT NULL,
  availability_data JSONB, -- Flexible structure
  ...
);
```

### API Response Format - Good Example
```json
{
  "productId": "pool-pass-001",
  "productName": "Pool Day Pass",
  "date": "2024-03-15",
  "availabilityType": "inventory",
  "slots": [
    {
      "available": true,
      "quantity": 35,
      "capacity": 50
    }
  ]
}

{
  "productId": "massage-swedish-60",
  "productName": "60-Minute Swedish Massage",
  "date": "2024-03-15",
  "availabilityType": "timeslot",
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "10:00", "available": true },
    { "time": "14:00", "available": true }
  ]
}
```

## Interview Discussion Topics

After reviewing the submission, use these as discussion points in the interview:

1. **Design decisions:** "Walk me through why you chose this schema design."
2. **Tradeoffs:** "What would break if we added a new product type?"
3. **Scalability:** "How would this handle 10,000 products? 1 million requests/day?"
4. **Alternatives:** "What other approaches did you consider?"
5. **Production readiness:** "What would you add before deploying this to production?"
6. **Extension:** "How would you add booking functionality on top of this?"

## Modifying the Assessment

### Making it Easier (2-3 hours)
- Remove the testing requirement
- Provide a suggested schema
- Only require one product type to work

### Making it Harder (Full day)
- Add booking functionality (reserve a slot/quantity)
- Add caching requirements
- Add rate limiting
- Require Swagger/OpenAPI documentation
- Add metrics/observability
- Multiple 3rd party sources with different contracts

### Changing the Domain
The core concept (internal + external data sources, abstraction, flexible modeling) works for many domains:
- Restaurant reservations (tables + external booking systems)
- Inventory management (warehouses + supplier APIs)
- Appointment scheduling (internal staff + contractor APIs)

## Frequently Asked Questions

**Q: Can candidates use an ORM like TypeORM or Prisma?**
A: Yes, but they should still understand the underlying schema. Knex is provided for flexibility.

**Q: Can candidates use a different tech stack?**
A: For fairness, it's better to keep it consistent. But if you want to allow it, update the README.

**Q: Should we give hints if they get stuck?**
A: For take-home assessments, no hints. For pair-programming style assessments, light hints are fine.

**Q: What if they don't finish in time?**
A: Partial submissions are fine. Focus on what they prioritized and how they approached the problem.

**Q: What if they over-engineer it?**
A: This can be a red flag. Good engineers know when to keep it simple. Discuss in the interview.

## Need Help?

If you have questions about evaluating a submission, consider:
1. Do the tests pass? That's a good baseline.
2. Is the schema flexible? Could it handle a new product type easily?
3. Is the API response consistent? Would a client need special logic for each type?
4. Is the code readable? Could another engineer maintain this?

When in doubt, focus on these core principles:
- **Separation of concerns**
- **Flexibility and extensibility**
- **Abstraction** (hide 3rd party details)
- **Simplicity** (don't over-engineer)

---

Good luck with your hiring! This assessment has been effective at identifying engineers who can design flexible systems and think about abstraction layers.

# Maintainer / Interviewer Guide

This is a **live pairing exercise** (60 minutes of hands-on time plus intro and wrap-up). The candidate integrates a noisy 3rd-party spa-booking API into a provided schema and extends an existing availability endpoint to serve both inventory products and time-slotted services with one consistent response shape.

The schema is provided, so the exercise is no longer about schema design. What it measures:

- **Integration & mapping design** — how they map a messy external payload into clean internal tables, and how they solve the deliberately open serviceId → product mapping question
- **API design** — one consistent response shape across two very different product types
- **Error handling** — graceful behavior when the vendor is down or the data is dirty
- **Testing** — do they reach for the provided scaffolding without being told
- **Collaboration** — thinking out loud, asking good questions, prioritizing under time pressure

## Pre-session setup (10 minutes, before the call)

1. Clone a fresh copy and **delete the `rubric/` directory** from the copy the candidate will see. Hand it over as a plain folder or a freshly initialized repo — **not with the existing `.git` history**, which contains interviewer material (including older versions of the rubric and hints).
2. `npm install && npm run migrate:latest && npm run seed:run`
3. `npm test` — everything should be green.
4. `npm run mock-api` in one terminal, `npm run dev` in another. Verify:
   - `curl http://localhost:3000/health`
   - `curl "http://localhost:3000/api/availability?productId=pool-pass-001&date=2024-03-15"` (returns 35/50)
   - `curl "http://localhost:3001/api/availability/spa-001?date=2024-03-15"` (returns slots)
5. Screen-share or remote environment ready; candidate drives.

## What to tell the candidate at the start

- Point them at `README.md` (the task list) and `mock-api/API.md` (the vendor contract). Give them ~5 minutes to read and poke around.
- The schema is provided; they should read the migrations rather than design tables — but they **may** add migrations, and the serviceId → product mapping is deliberately their call.
- The response format for the unified endpoint is their design.
- Encourage thinking out loud and treating you as a teammate/product owner: assumptions are fine if stated, and questions are welcome.
- `DESIGN.md` is scratch paper for their decisions — bullets, not prose.

## Suggested pacing (60 min hands-on)

Sixty minutes is tight. The **core** is tasks 1–2 — the integration and the unified endpoint working end to end. Failure handling and tests (tasks 3–4) are better *discussed well* than rushed badly: an explicit "here's exactly what I'd do" from a candidate who ran out of clock is a fine outcome, and the rubric accounts for it.

| Time | Checkpoint |
|---|---|
| 0–5 | Orientation: skims README, API.md, migrations; curls the mock API. Good sign: they notice how noisy the payload is right away. |
| 5–15 | Plan: mapping decision (spa-001 → which product?) and rough response shape sketched before writing code. If they dive straight into code with no plan, ask "what's your mapping story?" |
| 15–35 | **Core** — integration: fetch from mock API, map, persist into `product_timeslots` / `product_timeslot_details`. |
| 35–50 | **Core** — unified endpoint: extend `/api/availability` to serve slotted products with a consistent shape. |
| 50–60 | Failure handling + a test. If the clock runs out, downgrade these to discussion: "walk me through exactly what you'd do" — a crisp answer here still scores. |

Checkpoints are guidance, not a script. If a candidate sequences differently (e.g. tests first, endpoint before sync) that's fine — note *why* they chose their order. But if they're still deep in the integration at ~40 min, help them cut scope (e.g. persist only the fields the endpoint needs) rather than letting the unified endpoint go unbuilt.

## Built-in wrinkles (interviewer-only)

### The `available: 7` dirty-data quirk

The first spa-001 slot on 2024-03-15 has `"available": 7` — a **number** — while every other slot uses a boolean. The vendor doc types the field as `boolean | number` with no further guidance; that is intentional.

- Strong candidates notice it while reading the payload or the contract and normalize deliberately (treat truthy/positive as available), ideally with a comment or test.
- If their sync crashes or silently mis-stores that slot, let them debug for a few minutes, then nudge: "Take a close look at the first slot in the payload for spa-001."
- It's a discussion prompt either way: "What do you do when a vendor's types are inconsistent? Where do you normalize — at ingestion or at read time?"

### Failure simulation

The mock API fails deterministically so you can test error handling live:

- Append `?simulate=failure` to either availability endpoint → always 503.
- Or restart the mock server with `FAILURE_RATE=0.5 npm run mock-api` for random failures (default is 0 — no random failures).

Mid-session, once their integration works, ask: "The spa vendor just went down — show me." Watch whether their API degrades gracefully (sensible status/message, internal products unaffected, maybe stale data served) or 500s.

## Discussion questions

Schema critique (since it's provided, understanding it is the signal):

- "This schema was designed by another team. What would you change about it?" (Good answers: `reserved_quantity` redundancy in `inventory`; timezone handling for `start_time`; whether `available` as a boolean loses capacity information; details table 1:1 split tradeoffs.)
- "Why do you think there's no unique constraint on (product_id, date, start_time) in `product_timeslots`?" (Multiple providers can offer the same service at the same time.)
- "Where would a `bookings` table fit if we added reservations?"

Integration & design:

- "Walk me through your serviceId → product mapping. What happens when the vendor adds a fourth service?"
- "When does timeslot data get refreshed? How stale is acceptable?"
- "What did you choose to *discard* from the vendor payload, and why?"
- "How would your response shape hold up if we added a third product type, e.g. hourly rentals?"

Production readiness:

- "What would you add before shipping this?" (observability, retries/timeouts, idempotent sync, rate limits)
- "10,000 products, one request per second — where does this design strain first?"

## Scoring

Use `rubric/EVALUATION_RUBRIC.md`. Score right after the session while it's fresh, and note which hints from `rubric/HINTS.md` you had to give — unprompted vs. nudged matters.

## FAQ

**The candidate wants to change the provided schema.** Fine — adding migrations is allowed and can be a strong signal if justified. Redesigning from scratch is a time-management red flag; steer them back.

**They finished early.** Point them at the stretch items (refresh/caching strategy, date-range queries, N+1) or go deeper on the discussion questions.

**They're stuck and time is burning.** Give the relevant hint from `HINTS.md` and note it. A candidate who takes a nudge and runs with it is a positive signal, not a negative one.

**Can they look things up / use their usual tooling?** Yes — this is meant to resemble real work. Watch how they verify what they find.

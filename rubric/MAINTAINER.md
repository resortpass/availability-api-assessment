# Maintainer / Interviewer Guide

A **live pairing exercise**: 60 minutes hands-on plus intro and wrap-up. The candidate integrates a noisy 3rd-party spa-booking API into a provided schema and extends an existing availability endpoint to serve both inventory products and time-slotted services with one consistent response shape.

The schema is provided, so this is not a schema-design exercise. It measures:

- **Integration & mapping design** — messy external payload → clean internal tables; the deliberately open serviceId → product mapping
- **API design** — one consistent response shape across two product types
- **Error handling** — graceful behavior when the vendor is down
- **Testing** — do they reach for the provided scaffolding unprompted
- **Collaboration** — thinking out loud, good questions, prioritizing under time pressure

## Pre-session setup (10 minutes, before the call)

1. Clone a fresh copy and **delete `rubric/`** from the candidate's copy. Hand over a plain folder or freshly initialized repo — **not the existing `.git` history**, which contains interviewer material.
2. `npm install && npm run migrate:latest && npm run seed:run`
3. `npm test` — everything green.
4. `npm run mock-api` in one terminal, `npm run dev` in another. Verify:
   - `curl http://localhost:3000/health`
   - `curl "http://localhost:3000/api/availability?productId=pool-pass-001&date=2024-03-15"` (returns 35/50)
   - `curl "http://localhost:3001/api/availability/spa-001?date=2024-03-15"` (returns slots)
5. Screen-share or remote environment ready; candidate drives.

## What to tell the candidate at the start

- Point them at `README.md` (tasks) and `mock-api/API.md` (the vendor's request schema). The vendor's *response* payload is deliberately undocumented — exploring it (curl or `mock-api/example-response.json`) is part of the exercise. Give them ~5 minutes to read and poke around.
- The schema is provided — read the migrations, don't design tables. They **may** add migrations, and the serviceId → product mapping is deliberately their call.
- The unified response format is their design.
- Think out loud; treat you as a teammate/product owner. Stated assumptions are fine; questions welcome.
- No required design write-up — scratch notes, comments, or talking it through all work, but decisions must be voiced so you can probe tradeoffs.

## Suggested pacing (60 min hands-on)

The **core** is tasks 1–2: integration and unified endpoint working end to end. Failure handling and tests (tasks 3–4) are better *discussed well* than rushed badly — a crisp "here's exactly what I'd do" from a candidate out of clock is a fine outcome, and the rubric accounts for it.

| Time | Checkpoint |
|---|---|
| 0–5 | Orientation: skims README, API.md, migrations; curls the mock API or reads `example-response.json`. Good sign: notices the noisy payload right away. |
| 5–15 | Plan: mapping decision (spa-001 → which product?) and rough response shape sketched before coding. If they dive straight in, ask "what's your mapping story?" |
| 15–35 | **Core** — integration: fetch from mock API, map, persist into `product_timeslots` / `product_timeslot_details`. |
| 35–50 | **Core** — unified endpoint: extend `/api/availability` to serve slotted products with a consistent shape. |
| 50–60 | Failure handling + a test. If the clock runs out, downgrade to discussion: "walk me through exactly what you'd do" — a crisp answer still counts. |

Checkpoints are guidance, not a script. Different sequencing (tests first, endpoint before sync) is fine — note *why*. But if they're still deep in the integration at ~40 min, help them cut scope (e.g. persist only what the endpoint needs) rather than letting the unified endpoint go unbuilt.

## Failure simulation (interviewer-only)

- `?simulate=failure` on either availability endpoint → guaranteed 503.
- Or restart with `FAILURE_RATE=0.5 npm run mock-api` for random failures (default 0).

Once their integration works, ask: "The spa vendor just went down — show me." Graceful degradation (sensible status/message, internal products unaffected, maybe stale data) vs. a 500.

## Discussion questions

Schema critique (schema is provided — understanding it is the signal):

- "This schema was designed by another team. What would you change about it?" (Good answers: `reserved_quantity` redundancy in `inventory`; timezone handling for `start_time`; whether boolean `available` loses capacity information; details table 1:1 split tradeoffs.)
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

## Evaluation

Record the green/yellow/red flags from `rubric/EVALUATION_RUBRIC.md` right after the session while it's fresh. Note which hints from `rubric/HINTS.md` you gave — unprompted vs. nudged matters.

## FAQ

**They want to change the provided schema.** Fine — justified migrations can be a strong signal. Redesigning from scratch is a time-management red flag; steer them back.

**They finished early.** Stretch items (refresh/caching, date-range queries, N+1), deeper discussion questions, or an extension from `rubric/FOLLOWUPS.md`.

**They're stuck and time is burning.** Give the relevant hint from `HINTS.md` and note it. Taking a nudge and running with it is a positive signal.

**Can they look things up / use their usual tooling?** Yes — this should resemble real work. Watch how they verify what they find.

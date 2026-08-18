# Evaluation Guide — Live Session

No point scale. Check off the concrete behaviors you observed, record flags right after the session while it's fresh, and weigh green vs. red in your write-up.

**Notes that frame the flags:**

- **Expected ingestion approach:** a manual backfill — one-off script, simple sync endpoint, or on-demand fetch. Automated/scheduled sync is **not** expected; don't penalize a manual approach.
- **Unprompted vs. nudged:** note which hints from `HINTS.md` you gave. Unprompted beats nudged, but taking a nudge and running with it is itself a positive signal.
- **Normalize for the clock:** 60 minutes is tight. Tasks 1–2 done cleanly with failure handling and testing *talked through crisply* beats rushing all four.
- **Schema design is not evaluated** — the schema is provided. Schema understanding and critique counts (see green flags).

## Green flags

- Orientation: reads the payload before coding — curls the mock API or opens `mock-api/example-response.json`
- Integration: clean adapter/client boundary; vendor concepts don't leak into routes or tables
- Mapping: serviceId → product decided deliberately, tradeoffs voiced (constant map vs. mapping table vs. column)
- Mapping: persists only what the schema needs and says what payload noise is being discarded
- Response shape: one coherent shape for both product types — a client needn't know the source — decision voiced or noted
- Error handling: vendor 503 degrades gracefully — sensible status/message, internal products unaffected, timeouts/stale data considered, invalid input handled
- Code: follows the routes/services/repositories structure; strong typing, clear naming, small focused functions
- Testing: reaches for the scaffolding unprompted; covers a failure case deterministically (nock or `?simulate=failure`); tests alongside code, not bolted on
- Collaboration: thinks out loud; asks clarifying questions early (timezones, staleness, mapping ownership); states assumptions
- Prioritization: cuts scope deliberately — "I'm skipping X for time; here's exactly what I'd do"
- Schema critique: sharp when asked (`reserved_quantity` redundancy, timezone gaps, boolean `available` losing capacity)

## Yellow flags — worth probing

- Mapping works but the choice is unexamined — no tradeoffs until you ask
- Minor vendor leakage into internal code, or minor asymmetries between the two product types' shapes
- Failures caught and surfaced sanely, but edge cases (timeouts, partial data) unexplored
- Dives into code with no stated plan, but recovers when asked ("what's your mapping story?")
- Generally clean code with some `any` types or misplaced logic
- Happy-path tests only, or testing starts only after prompting
- Quiet stretches or occasional redirection needed, but responds well to it
- Explicitly **not red**: skipping tests as a stated time tradeoff with a crisp description of what they'd test

## Red flags

- Vendor payload persisted wholesale (therapist ratings, room amenities, fee fields in the tables)
- No mapping decision at all, or duplicate products inserted for the vendor services
- Response shapes diverge enough that clients need per-type logic, or vendor IDs/fields exposed directly
- Vendor outage crashes the whole availability endpoint (unhandled rejection / bare 500)
- Everything in one place — vendor calls inline in routes, weak typing, hard to follow
- Ignores tests entirely with no stated reason, or breaks the provided suite without noticing
- Silent, opaque work for long stretches despite prompting
- Can't explain their own decisions; ignores interviewer input; no prioritization (e.g. half the session gold-plating one layer)

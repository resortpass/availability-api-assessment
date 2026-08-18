# Follow-ups — Extensions Beyond the Core Tasks

Interviewer-only. Use when a strong candidate finishes early, in a later round, or as pure discussion — whiteboard/talk is fine for all of them. Pick one or two and go deep rather than touring the list.

Each one is grounded in something the exercise deliberately discards or leaves out, so "did you notice that in the payload/schema?" is always a fair anchor. Start with the **priority follow-ups** (hiring-team picks, in order); the **additional follow-ups** are extra depth if time allows.

---

# Priority follow-ups

## 1. Data freshness — keeping synced slots honest

**Prompt:** "Your sync ran once. In production, slots get booked and released on the vendor's side all day. How do you keep `product_timeslots` fresh, and how stale is acceptable?"

**Format:** conversational — no code expected. The manual backfill from the main task (one-off script, sync endpoint, or on-demand fetch) is the assumed starting point the discussion builds on.

**Good solutions:**
- Idempotency before cadence: re-running sync must upsert, not duplicate. Natural key is the vendor `slotId`, which their mapping should already land in `product_timeslot_details.external_id` (indexed for exactly this). Without it every re-sync doubles rows — `product_timeslots` has no unique constraint to save them.
- Disappeared slots: the next payload simply omits a slot. Delete-and-replace per (product_id, date) in a transaction vs. flipping `available = false` — and what each does to rows a future `bookings` table might reference.
- Refresh channel: polling cadence vs. vendor webhooks vs. read-through (fetch on request + TTL cache), weighed against the failure modes they already handled (503, `?simulate=failure`).
- Staleness is a product decision: browse can be minutes stale **if** booking re-validates against the vendor at write time. "Stale reads, verified writes" is a strong signal.
- Surfacing freshness: `updated_at` already exists everywhere — a `lastSyncedAt` in the response, and labeled stale data when the vendor is down.

**Watch out for:** "Poll every minute" with no idempotency story — duplicate rows on re-sync is the real trap in this schema.

---

## 2. Modeling areas / facilities

**Prompt:** "Guests want to browse by area — 'what's available in the Main Spa Building?' — and the resort wants facilities to be first-class. How would you model areas, and how does the vendor data feed them?"

**Good solutions:**
- The payload already carries `facilityId` ("FAC-MAIN-01"), `facilityName` ("Main Spa Building"), `roomNumber`, `roomType`, `floor` on **every slot** — all currently discarded.
- An `areas`/`facilities` table with the vendor `facilityId` as its external id, upserted during sync (dedupe on `facilityId`).
- Where the FK hangs is the crux: on `product_timeslots` (slot grain — correct), not `products`. Proof: spa-001's 15:00 slot on 2024-03-15 is at FAC-EAST-02 while its other slots that day are at FAC-MAIN-01.
- Rooms: second-level table vs. a plain `room_number` column on `product_timeslot_details` — queryable structure or display metadata? Either, if argued.
- API impact: `?areaId=` filter needs an index on the new FK; the unified response gains an `area` block — and what does it mean for `pool-pass-001` (inventory products live in an area too)?

**Watch out for:** Putting the facility on `products` — the payload demonstrably has one service spanning two facilities in a single day.

---

## 3. Filtering by provider credentials / rating

**Prompt:** "Product wants filters like 'female therapist with a prenatal certification, rated 4.8+'. The vendor sends all of that; we store none of it. Walk me through supporting it."

**Good solutions:**
- The fields exist per slot: `certifications` (string array, e.g. "Prenatal Massage" on T003), `experienceYears`, `rating` — alongside `gender`, the only one the details table already stores.
- Grain problem: these are provider facts repeated identically on every one of that therapist's slots. Strong move: a `providers` table keyed on `therapistId` (→ existing `provider_id`) with name/gender/rating/experience_years, plus a `provider_certifications` join table — not more columns on the 1:1 `product_timeslot_details`.
- Arrays: join table (cleanly queryable) vs. JSON column (simpler, LIKE-matching in SQLite) — either, tradeoff stated.
- Filter semantics for inventory products: what does `minRating=4.8` mean for `pool-pass-001`? Exclude, ignore, or 400 — a deliberate choice, consistent with their unified-shape philosophy.
- Freshness: `rating` moves vendor-side between syncs — snapshot-per-slot vs. live provider record, and who wins on conflict.

**Watch out for:** Bolting `rating`/`certifications` columns onto `product_timeslot_details`. It works, but duplicates provider facts across hundreds of rows and turns "Sarah's rating changed" into a mass update — acceptable only if they name that tradeoff.

---

## 4. A second vendor with a different contract

**Prompt:** "We're adding a second vendor — resort activities with group sessions — whose API looks like this. What survives from your integration, and what breaks?" *(Hand them `rubric/example-response-two.json`. It lives in `rubric/` deliberately so candidates never see it during the core exercise — share it only when posing this follow-up.)*

The sample contract differs from SpaBooking on purpose: no `{success, data}` envelope (flat top level with `page`/`per_page`/`total_sessions`/`next_page` pagination), snake_case naming, a flat `sessions` list instead of date → service → slots nesting, ISO 8601 datetimes with a timezone offset (`starts_at: "2024-03-15T07:00:00-05:00"`) instead of naive `HH:MM` + separate date, and **capacity counts** (`capacity`/`spots_remaining` + a `status` of open/full/cancelled) instead of a boolean.

**Good solutions:**
- The schema mostly holds: `product_timeslots` is vendor-neutral; the nested `instructor` object maps to `provider_id`/`provider_name`, `session_id` to `external_id` — **but** `external_id` now needs vendor scoping (a `source` column or prefix) or ids can collide across vendors.
- Availability semantics need a policy: `spots_remaining > 0` **and** `status === "open"` → available. The payload includes a trap — session RA-88270 is `"status": "cancelled"` with `spots_remaining: 5`; a naive count check books a cancelled session. And does the boolean `available` column lose capacity info we now want?
- Time handling: `starts_at`/`ends_at` carry the date and an offset; their sync must derive `date`/`start_time`/`end_time` — in whose timezone? (Naive columns bite here; see follow-up 8.)
- Mapping stress-test: a hardcoded serviceId map breaks on `activity_code`; a mapping table wants (vendor, vendor_service_id, product_id). Revisit what they chose in the session — did they predict this?
- Adapter shape and isolation: each vendor client fetches (now with pagination) + normalizes to one internal `SlotInput`; shared sync orchestration; one vendor down must not block or poison the other. Bonus: `location_code` feeds the areas model (follow-up 2), `price_cents` vs. decimal prices feeds pricing (follow-up 7).

**Watch out for:** A "universal vendor schema" designed up front. The lesson is normalize-at-the-edge into internal tables, not a lowest-common-denominator god model.

---

# Additional follow-ups

## 5. Querying products by duration

**Prompt:** "How would you support querying products by duration — e.g. show me all 60-minute services?"

**Good solutions:**
- The vendor's service catalog carries a per-service `duration` in minutes (60/90/30) — currently discarded, and `products` has no column for it.
- A migration adding `duration_minutes` to `products` (nullable — `pool-pass-001` has none), backfilled during ingestion from the service payload.
- Then it's a simple indexed filter: `?duration=60` against `products.duration_minutes`.
- Filter semantics for inventory products: null duration — excluded or ignored, consistent with their unified-shape choices.

**Watch out for:** Storing duration per-slot — it's service-grain (derivable from `start_time`/`end_time`, but that's the wrong place to query) — or parsing it out of product names ("60-Minute Swedish Massage").

---

## 6. Booking on top of availability

**Prompt:** "Availability is read-only today. Design the write path — `POST /api/bookings` for a specific slot. What changes in the schema, and where does this go wrong under concurrency?"

**Good solutions:**
- A `bookings` table referencing `product_timeslots.id`; inventory products take a different path — decrement `available_quantity` / bump `reserved_quantity` under the existing `available_quantity >= 0` check constraint.
- Guarded flip: `UPDATE ... SET available = false WHERE id = ? AND available = true` + affected-rows check, in a transaction. Read-then-write races; two guests get the same 09:00.
- No unique constraint on (product_id, date, start_time) — deliberate, multiple providers — so clients book a **slot id**, never a (product, date, time) triple; identical-looking 09:00 rows differ only by `provider_id`.
- Vendor two-phase reality: local row is a *hold*, vendor confirm is the booking (booked slots in the payload carry `bookingId`/`bookedUntil`). Compensate when vendor confirm fails after local commit.
- Hold expiry (`bookedUntil`-style TTL) frees abandoned checkouts; deposits/cancellation come from the discarded service-level `requiresDeposit`, `depositAmount`, `cancellationPolicy` ("24_HOURS").

**Watch out for:** Flipping `available = false` with no transaction/guard, or keying the booking on (productId, date, startTime) — ambiguous by design.

---

## 7. Dynamic pricing from the vendor

**Prompt:** "The vendor prices slots dynamically — early-bird discounts, peak surcharges, fees, tax. We store one `base_price` per product. How would you represent per-slot pricing and serve it in the availability response?"

**Good solutions:**
- The payload's split: **slot-level** `yieldId` ("YIELD-EARLY-BIRD" … "YIELD-WEEKEND-PEAK"), `yieldMultiplier` (0.8–1.2), `bookingFee`, `processingFee`; **service-level** `originalPriceBeforeYield`, `taxRate`, `price`. For spa-001, 150.00 × 0.8 = the catalog `price` of 120.00 — the flat price only describes one slot's yield.
- So `products.base_price` is the wrong grain. Snapshot a computed `effective_price` onto `product_timeslots` at sync (auditable, drifts) vs. store the rule inputs and compute at read (fresh, harder to audit).
- Fees and tax as separate line items, not blended — checkout needs the breakdown, and they live at different levels (`taxRate` per service, fees per slot).
- Money hygiene: decimals not floats; carry `currency` (already char(3) on `products`) per line item.
- Quote validity: the vendor can re-yield between availability and booking — re-validate or hold a quote with expiry (ties to follow-up 6).

**Watch out for:** One blended price with no breakdown, or hanging price on `products` right after seeing the same product's slots carry different multipliers on one day.

---

## 8. Timezones

**Prompt:** "A guest in New York books the 09:00 slot. 09:00 in whose timezone? Walk me through where timezones enter this system and what you'd change."

**Good solutions:**
- The vendor contract is silent: `startTime`/`endTime` are naive "HH:MM". The only zoned value is `bookedUntil` ("2024-03-15T16:30:00Z") — its UTC time matches that slot's naive `endTime` 16:30, implying vendor times are UTC. Best answers spot the evidence *and* say "I'd confirm with the vendor."
- The schema mirrors it: bare `time` columns for `start_time`/`end_time`, bare `date`, and no timezone column anywhere (not on `products` either). Minimum fix: a property-level timezone column plus a declared storage convention.
- Store UTC and render property-local, or store property-local with an explicit zone — either works; the sin is naive times with no convention.
- Date-boundary bite: a UTC 23:30 slot can be "tomorrow" at the resort, silently shifting `?date=` queries; DST spring-forward makes some local times nonexistent.
- API contract: ISO 8601 with offset, or local time + explicit `timezone` field — pick one and state it.

**Watch out for:** Reflexive "store everything in UTC" that never addresses that `?date=` and guest-facing display are property-local concepts.

---

## 9. Date-range queries at scale

**Prompt:** "Product wants a 30-day availability calendar for every product on a resort page, and we're at 10,000 products. Evolve the API and the queries."

**Good solutions:**
- API first: `from=`/`to=` replacing `date=`, grouped by date — and the realization that a calendar wants per-day **summaries** (counts), not full slot rows; keep the detailed per-day endpoint separate.
- Query plan: the provided (product_id, date) indexes on `product_timeslots` and `inventory` already cover ranged lookups; the N+1 risk is the per-slot join to `product_timeslot_details`, which the summary view shouldn't touch at all.
- Rollups: 10k products × 30 days × ~10 slots is millions of rows per page-load if naive. A per-(product_id, date) available-count rollup, maintained at sync time — note `inventory` effectively *is* that rollup for inventory products.
- Caching keyed on (product, date) with sync-driven invalidation and a stated staleness budget (ties to follow-up 1).
- Guardrails: max range / pagination — don't let `?from=2020&to=2030` through.

**Watch out for:** "Add Redis" before any query or rollup design — caching a bad access pattern just hides it until the cache misses.

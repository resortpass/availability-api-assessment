# Follow-ups — Extensions Beyond the Core Tasks

Interviewer-only. Use when a strong candidate finishes early, in a later round, or as pure discussion — whiteboard/talk is fine for all of them. Pick one or two and go deep rather than touring the list.

Each one is grounded in something the exercise deliberately discards or leaves out, so "did you notice that in the payload/schema?" is always a fair anchor. Start with the **priority follow-ups** (hiring-team picks, in order); the **additional follow-ups** are extra depth if time allows. Entries use the same convention as `EVALUATION_RUBRIC.md`: green = strong observed answer, yellow = partially right / worth probing, red = concern.

---

# Priority follow-ups

## 1. A second vendor with a different contract

**Prompt:** "We're adding a second vendor — resort activities with group sessions — whose API looks like this. What survives from your integration, and what breaks?" *(Hand them `rubric/example-response-two.json`. It lives in `rubric/` deliberately so candidates never see it during the core exercise; share it only when posing this follow-up.)*

The contract differs from SpaBooking on purpose: no `{success, data}` envelope, snake_case naming, a flat `sessions` list instead of date → service → slots nesting, ISO 8601 datetimes with a timezone offset (`starts_at: "2024-03-15T07:00:00-05:00"`) instead of naive `HH:MM` + separate date, and **capacity counts** (`capacity`/`spots_remaining` + a `status` of open/full/cancelled) instead of a boolean. Instructor objects carry their own flavor of provider facts: `credentials` (different vocabulary than SpaBooking's `certifications`) and `avg_review_score` on a **10-point scale** with `review_count`.

**Green flags:**
- Sees the schema mostly holds: `product_timeslots` is vendor-neutral; maps the nested `instructor` object to `provider_id`/`provider_name` and `session_id` to `external_id` — and flags that `external_id` now needs vendor scoping (a `source` column or prefix) before ids collide across vendors.
- Defines an availability policy for counts: `spots_remaining > 0` **and** `status === "open"` → available. Catches the trap — session RA-88270 is `"status": "cancelled"` with `spots_remaining: 5` — and asks whether the boolean `available` column now loses capacity info we want.
- Handles time deliberately: notices `starts_at`/`ends_at` carry the date and an offset, and asks in whose timezone to derive `date`/`start_time`/`end_time` (naive columns bite here; see follow-up 9).
- Stress-tests their own mapping: admits a hardcoded serviceId map breaks on `activity_code` and reaches for a mapping table keyed (vendor, vendor_service_id, product_id) — ideally recalling what they chose in the session and whether they predicted this.
- Sketches adapter isolation: each vendor client fetches + normalizes to one internal `SlotInput`; shared sync orchestration; one vendor down doesn't block or poison the other. Bonus: connects the nested `location {code, name}` object to the areas model (follow-up 3), instructor `avg_review_score`/`credentials` to rating and credentials (follow-ups 2 and 4), and `price_cents` vs. decimal prices to pricing (follow-up 8).

**Yellow flags:**
- Maps the fields correctly but misses the id-collision risk — asked "what if both vendors emit the same external id?", course-corrects well.
- Coerces `spots_remaining` to a boolean without deciding what `status` means; catches RA-88270 only when you point at it, but then generalizes to a real policy.
- Names adapter isolation but can't say what happens when vendor two dies mid-sync — the boundary is a folder, not a design, until probed.

**Red flags:**
- Designs a "universal vendor schema" up front — a lowest-common-denominator god model instead of normalize-at-the-edge into internal tables.

---

## 2. Filtering by star rating

**Prompt:** "Guests want to filter by provider rating — 'rated 4.8+'. How would you support it?"

**Green flags:**
- Names the grain problem unprompted: `rating` (and `experienceYears`) sit on every slot but are provider facts, repeated identically across a therapist's slots — proposes a `providers` table keyed on `therapistId` (→ existing `provider_id`) holding rating/experience plus name/gender, not more columns on the 1:1 `product_timeslot_details`.
- Designs `?minRating=4.8` as a numeric filter joining through `providers` — indexed if it's a hot path.
- Raises freshness unprompted: `rating` moves vendor-side between syncs — snapshot vs. live provider record, and who wins on conflict.
- Decides filter semantics for inventory products: `minRating` on `pool-pass-001` — exclude, ignore, or 400, consistent with their unified-shape choices.
- Cross-vendor bonus (if follow-up 1 was posed): spots the scale problem — the second vendor's `avg_review_score` is on a **10-point scale** with `review_count`, so "rated 4.8+" needs scale normalization, and a rating backed by 12 reviews isn't a rating backed by 243.

**Yellow flags:**
- Filter design is right but freshness never surfaces — asked "the vendor re-scores Sarah overnight, what do we serve?", answers well.
- Given the second vendor, converts 9.4/10 → 4.7/5 mechanically — scale handled, confidence (`review_count` 12 vs. 243) unexamined until prompted.
- Starts with rating on `product_timeslot_details` but self-corrects when the mass-update problem is raised.

**Red flags:**
- Stores `rating` per-slot — "Sarah's rating changed" becomes a mass update — and defends it.
- Invents local rating logic (averaging, recomputing) when the vendor owns the number.

---

## 3. Modeling areas / facilities

**Prompt:** "Guests want to browse by area — 'what's available in the Main Spa Building?' — and the resort wants facilities to be first-class. How would you model areas, and how does the vendor data feed them?"

**Green flags:**
- Finds the discarded fields: `facilityId` ("FAC-MAIN-01") and `facilityName` ("Main Spa Building") already sit on every slot in the payload.
- Designs an `areas` table: `id`, `name`, `external_id` (the vendor `facilityId`), maybe `description` — upserted during sync, deduped on `external_id`.
- Chooses a through table (`product_areas`: `product_id`, `area_id`) over a single FK — citing that spa-001's slots on 2024-03-15 span FAC-MAIN-01 and FAC-EAST-02, and that internal products like `pool-pass-001` belong to areas too.
- Extends the API coherently: `?areaId=` filter via the join table; the unified response gains an `area`/`areas` block.
- Cross-vendor bonus (if follow-up 1 was posed): maps the second vendor's `location {code, name}` onto the same `areas` table (`code` → `external_id`, `name` → `name`) — same model, different vendor shape.

**Yellow flags:**
- Starts with `area_id` on `products` but flips to the through table when shown spa-001 spanning two facilities in one day.
- Models areas from the vendor payload only — where internal products like `pool-pass-001` live needs prompting.
- Inserts area rows during sync with no dedup/uniqueness story for `external_id` until you ask what 200 FAC-MAIN-01 slots produce.

**Red flags:**
- A single `area_id` column on `products` presented as the whole answer, unmoved by the one-service-two-facilities evidence in the payload.

---

## 4. Filtering by provider credentials

**Prompt:** "Product wants filters like 'female therapist with a prenatal certification'. The vendor sends all of that; we store almost none of it. Walk me through supporting it."

**Green flags:**
- Locates the data: `certifications` (string array, e.g. "Prenatal Massage" on T003) sits on every slot — alongside `gender`, the only one the details table already stores.
- Applies the providers-table grain reasoning: certifications are provider facts repeated identically across a therapist's slots. If the rating follow-up (2) already produced that table, this is adding a `provider_certifications` join table on top; posed alone, the same grain argument should surface — either way, not more columns on the 1:1 `product_timeslot_details`.
- Weighs array storage: join table (cleanly queryable) vs. JSON column (simpler, LIKE-matching in SQLite) — either, with the tradeoff stated.
- Decides filter semantics for inventory products: what a certification filter means for `pool-pass-001` — exclude, ignore, or 400 — consistent with their unified-shape philosophy.
- Cross-vendor bonus (if follow-up 1 was posed): notices the second vendor's `credentials` vocabulary differs ("Prenatal Yoga Certified" vs. "Prenatal Massage") — the providers model must absorb both, and "prenatal" filtering across vendors becomes a vocabulary-mapping question.

**Yellow flags:**
- Reaches the providers-table design, but only after you point out the same facts repeating across every one of a therapist's slots.
- Picks JSON-column storage for speed without naming the queryability cost (or the join table without acknowledging its weight for a three-provider dataset).
- Ignores `pool-pass-001` until you ask what the filter returns for it — then makes a deliberate call.

**Red flags:**
- Bolts a `certifications` column onto `product_timeslot_details` and calls it done — duplicates provider facts across hundreds of rows with no acknowledged tradeoff.

---

## 5. Data freshness — keeping synced slots honest

**Prompt:** "Your sync ran once. In production, slots get booked and released on the vendor's side all day. How do you keep `product_timeslots` fresh, and how stale is acceptable?"

**Format:** conversational — no code expected. The manual backfill from the main task (one-off script, sync endpoint, or on-demand fetch) is the assumed starting point the discussion builds on.

**Green flags:**
- Leads with idempotency: re-running sync must upsert, not duplicate — keys on the vendor `slotId` their mapping already lands in `product_timeslot_details.external_id` (indexed for exactly this), and knows `product_timeslots` has no unique constraint to save them otherwise.
- Handles disappeared slots: the next payload simply omits one — delete-and-replace per (product_id, date) in a transaction vs. flipping `available = false`, weighing what each does to rows a future `bookings` table might reference.
- Compares refresh channels: polling cadence vs. vendor webhooks vs. read-through (fetch on request + TTL cache), weighed against the failure modes they already handled (503, `?simulate=failure`).
- Treats staleness as a product decision: browse can be minutes stale **if** booking re-validates against the vendor at write time — "stale reads, verified writes."
- Surfaces freshness: `updated_at` already exists everywhere — proposes a `lastSyncedAt` in the response and labeled stale data when the vendor is down.

**Yellow flags:**
- Picks a cadence and a staleness budget, but idempotency only surfaces when you ask "run your sync twice — what's in the table?"
- Answers "webhooks" with no fallback for a vendor that doesn't offer them, or for missed events.
- Handles upsert but not deletion — disappeared slots stay available until prompted.

**Red flags:**
- "Poll every minute" with no idempotency story — duplicate rows on re-sync is the real trap in this schema.

---

# Additional follow-ups

## 6. Querying products by duration

**Prompt:** "How would you support querying products by duration — e.g. show me all 60-minute services?"

**Green flags:**
- Finds `duration` in the vendor's service catalog (60/90/30, minutes) — currently discarded, with no `products` column for it.
- Adds a migration: nullable `duration_minutes` on `products` (`pool-pass-001` has none), backfilled during ingestion from the service payload.
- Ends with a simple indexed filter: `?duration=60` against `products.duration_minutes`.
- Decides semantics for inventory products: null duration — excluded or ignored, consistent with their unified-shape choices.

**Yellow flags:**
- Derives duration from slot `start_time`/`end_time` at query time — works, but should name why the service catalog is the cleaner source.
- Adds the column but forgets the backfill — existing rows stay null until you ask how it gets populated.

**Red flags:**
- Stores duration per-slot — it's service-grain, and the slot table is the wrong place to query it.
- Parses duration out of product names ("60-Minute Swedish Massage").

---

## 7. Booking on top of availability

**Prompt:** "Availability is read-only today. Design the write path — `POST /api/bookings` for a specific slot. What changes in the schema, and where does this go wrong under concurrency?"

**Green flags:**
- Adds a `bookings` table referencing `product_timeslots.id`; routes inventory products differently — decrement `available_quantity` / bump `reserved_quantity` under the existing `available_quantity >= 0` check constraint.
- Guards the flip: `UPDATE ... SET available = false WHERE id = ? AND available = true` + affected-rows check, in a transaction — and can explain the read-then-write race (two guests, same 09:00).
- Books by **slot id**, never a (product, date, time) triple — citing the deliberate lack of a unique constraint on (product_id, date, start_time); identical-looking 09:00 rows differ only by `provider_id`.
- Sees the vendor two-phase reality: local row is a *hold*, vendor confirm is the booking (booked slots in the payload carry `bookingId`/`bookedUntil`) — and plans compensation when vendor confirm fails after local commit.
- Adds hold expiry (`bookedUntil`-style TTL) for abandoned checkouts; pulls deposits/cancellation from the discarded service-level `requiresDeposit`, `depositAmount`, `cancellationPolicy` ("24_HOURS").

**Yellow flags:**
- Transaction instinct is right but the guard is read-then-check-then-write inside it — pushed on "two requests land simultaneously," arrives at the conditional UPDATE.
- Local design is solid but the vendor side is an afterthought — no answer for a vendor confirm failing after local commit until asked.
- Keys the booking on (productId, date, startTime) at first, but self-corrects to slot id when shown two providers at 09:00.

**Red flags:**
- Flips `available = false` with no transaction or guard.
- Stays on (productId, date, startTime) as the booking key — ambiguous by design.

---

## 8. Dynamic pricing from the vendor

**Prompt:** "The vendor prices slots dynamically — early-bird discounts, peak surcharges, fees, tax. We store one `base_price` per product. How would you represent per-slot pricing and serve it in the availability response?"

**Green flags:**
- Reads the payload's split correctly: **slot-level** `yieldId` ("YIELD-EARLY-BIRD" … "YIELD-WEEKEND-PEAK"), `yieldMultiplier` (0.8–1.2), `bookingFee`, `processingFee`; **service-level** `originalPriceBeforeYield`, `taxRate`, `price` — and spots that for spa-001, 150.00 × 0.8 = the catalog `price` of 120.00, so the flat price only describes one slot's yield.
- Concludes `products.base_price` is the wrong grain; weighs snapshotting a computed `effective_price` onto `product_timeslots` at sync (auditable, drifts) vs. storing the rule inputs and computing at read (fresh, harder to audit).
- Keeps fees and tax as separate line items — checkout needs the breakdown, and they live at different levels (`taxRate` per service, fees per slot).
- Money hygiene: decimals not floats; carries `currency` (already char(3) on `products`) per line item.
- Raises quote validity: the vendor can re-yield between availability and booking — re-validates or holds a quote with expiry (ties to follow-up 7).

**Yellow flags:**
- Lands per-slot pricing but blends fees and tax into one number until you ask what checkout displays.
- Picks snapshot or compute-at-read without naming the other side's cost (drift vs. auditability).
- Notices the multipliers but not the level split — treats `taxRate` as per-slot or `yieldMultiplier` as per-service until probed.

**Red flags:**
- One blended price with no breakdown.
- Hangs price on `products` right after seeing the same product's slots carry different multipliers on one day.

---

## 9. Timezones

**Prompt:** "A guest in New York books the 09:00 slot. 09:00 in whose timezone? Walk me through where timezones enter this system and what you'd change."

**Green flags:**
- Reads the evidence: `startTime`/`endTime` are naive "HH:MM"; the only zoned value is `bookedUntil` ("2024-03-15T16:30:00Z"), whose UTC time matches that slot's naive `endTime` 16:30 — implies vendor times are UTC *and* says "I'd confirm with the vendor."
- Maps the schema's mirror of the problem: bare `time` columns for `start_time`/`end_time`, bare `date`, no timezone column anywhere (not on `products` either) — proposes a property-level timezone column plus a declared storage convention.
- Commits to a convention: store UTC and render property-local, or store property-local with an explicit zone — either, consistently; names naive-times-with-no-convention as the sin.
- Calls the date-boundary bite: a UTC 23:30 slot can be "tomorrow" at the resort, silently shifting `?date=` queries; DST spring-forward makes some local times nonexistent.
- Picks an API contract: ISO 8601 with offset, or local time + explicit `timezone` field — stated, not implied.

**Yellow flags:**
- Asks "whose timezone?" but misses the `bookedUntil` evidence until pointed at it — then reasons well from it.
- Proposes storing UTC without noticing `?date=` semantics shift at resort date boundaries until you raise the 23:30 slot.
- Adds a timezone column but leaves the API contract implicit — "the client will figure it out."

**Red flags:**
- Reflexive "store everything in UTC" that never addresses that `?date=` and guest-facing display are property-local concepts.

---

## 10. Date-range queries at scale

**Prompt:** "Product wants a 30-day availability calendar for every product on a resort page, and we're at 10,000 products. Evolve the API and the queries."

**Green flags:**
- API first: `from=`/`to=` replacing `date=`, grouped by date — and realizes a calendar wants per-day **summaries** (counts), not full slot rows; keeps the detailed per-day endpoint separate.
- Reads the query plan: the provided (product_id, date) indexes on `product_timeslots` and `inventory` already cover ranged lookups; names the per-slot join to `product_timeslot_details` as the N+1 risk the summary view shouldn't touch at all.
- Does the volume math: 10k products × 30 days × ~10 slots is millions of rows per page-load if naive — proposes a per-(product_id, date) available-count rollup maintained at sync time, noting `inventory` effectively *is* that rollup for inventory products.
- Caches keyed on (product, date) with sync-driven invalidation and a stated staleness budget (ties to follow-up 5).
- Adds guardrails: max range / pagination — doesn't let `?from=2020&to=2030` through.

**Yellow flags:**
- Extends the endpoint to ranges but returns full slot rows for 30 days — the summary-vs-detail split needs prompting.
- Proposes the rollup with no consistency story — when does it update, and what happens if sync fails halfway?
- Guardrails (range caps, pagination) appear only when you ask about `?from=2020&to=2030`.

**Red flags:**
- "Add Redis" before any query or rollup design — caching a bad access pattern just hides it until the cache misses.

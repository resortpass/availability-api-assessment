# Hints — Verbal Nudges for the Live Session

Give the smallest nudge that unblocks, and note in your evaluation which hints you gave — the rubric weighs unprompted vs. nudged. Let them struggle productively for 2–3 minutes first. Struggling *silently* gets a different nudge: "talk me through what you're looking at."

---

## Hint 1: serviceId → product mapping

**Sticking point:** Can't decide how `spa-001` relates to a `products` row, or hasn't noticed the seeds already contain `massage-swedish-60` etc. and is about to create duplicate products.

**Nudge:** "Have a look at what's already in the products seed. How could you connect the vendor's `spa-001` to one of those rows?"

**Strong candidates, unprompted:** Check the seeds early, spot the spa catalog rows, and pick a mapping deliberately — constant map, mapping table, or new column — naming what each costs ("a hardcoded map is fine for three services; I'd want a table once the catalog churns").

**When to give:** By ~15 min if there's still no mapping decision; immediately if they start inserting duplicate products.

---

## Hint 2: Unifying the response shape

**Sticking point:** One shape for inventory products, a totally different one for slotted — or stalled hunting for the "right" universal format.

**Nudge:** "If you were the client consuming this endpoint, what would you want the response to look like for both product types? There's no single right answer — pick one and tell me the tradeoff."

**If they need more:** "Some teams force everything into a slots array — an inventory product is one all-day slot with a quantity. Others keep a type discriminator and a per-type payload. Either can work."

**Strong candidates, unprompted:** Sketch the shape *before* coding, mention the client's perspective, and state the choice and tradeoff — out loud, in a note, or in a comment.

**When to give:** When they start writing the endpoint with no stated format plan, or when two divergent shapes have already appeared.

---

## Hint 3: Handling vendor failure

**Sticking point:** No error handling around the HTTP call — a vendor 503 becomes an unhandled rejection or bare 500 — or they can't reproduce a failure.

**Nudge:** "The mock API can fail on demand — check the failure-simulation section of `mock-api/API.md`. What should *your* endpoint do when the vendor is down?"

**Strong candidates, unprompted:** Wrap the client call, choose a behavior deliberately (clean 502/503, serve stale persisted slots, or degrade to internal products only), state the tradeoff, demo with `?simulate=failure`.

**When to give:** Once the happy path works. If failure hasn't come up by ~50 min, trigger it: "The spa vendor just went down — show me what happens." No coding time left? Take the answer verbally.

---

## Hint 4: Drowning in the vendor payload

**Sticking point:** Trying to persist everything — therapist ratings, amenities, fees — altering the schema to fit the vendor or writing a 30-field mapper.

**Nudge:** "Look at what `product_timeslots` and `product_timeslot_details` actually store. Work backwards from those columns — what's the minimum you need from the payload?"

**Strong candidates, unprompted:** Map only startTime/endTime/available plus the detail columns (therapistName → provider_name, therapistId → provider_id, gender, slotId → external_id), and say the rest is noise they're discarding.

**When to give:** As soon as they build types or storage for vendor fields the schema has no home for.

---

## Hint 5: Testing without the flakiness

**Sticking point:** Avoiding tests because "it needs the mock server running," or writing order-dependent tests that make real HTTP calls.

**Nudge:** "Have a look at the examples in `tests/` — there's one that stubs the vendor's HTTP API with nock. And the mock API's `?simulate=failure` gives you a deterministic failure if you'd rather go end-to-end."

**Strong candidates, unprompted:** Find the scaffolding themselves, extend the skipped/TODO scaffold, cover the unified endpoint plus one failure case.

**When to give:** If ~50 minutes pass with no tests and no stated plan, or the moment they skip tests for logistical (not time-prioritization) reasons. Skipping tests as a *stated time tradeoff* is fine — ask what they'd test instead.

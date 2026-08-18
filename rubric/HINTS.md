# Hints — Verbal Nudges for the Live Session

Deliver these verbally when a candidate is stuck. Give the smallest nudge that unblocks them, and note in your evaluation which hints you gave — the rubric weighs unprompted vs. nudged behavior.

General rule: in a 60-minute session, let them struggle productively for 2–3 minutes before nudging. Struggling *silently* is worth a different nudge: "talk me through what you're looking at."

---

## Hint 1: serviceId → product mapping

**Sticking point:** They can't decide how `spa-001` relates to a `products` row, or they haven't noticed the seeds already contain `massage-swedish-60` etc. and are about to create duplicate products.

**Nudge:** "Have a look at what's already in the products seed. How could you connect the vendor's `spa-001` to one of those rows?"

**Strong candidates, unprompted:** Check the seeds early, notice the spa catalog rows exist, and pick a mapping deliberately — a constant map in code, a mapping table, or a new column — while saying out loud what each option costs (e.g. "a hardcoded map is fine for three services but I'd want a table once the vendor catalog churns").

**When to give:** By ~15 min if there's still no mapping decision; immediately if they start inserting duplicate products.

---

## Hint 2: Unifying the response shape

**Sticking point:** They return one shape for inventory products and a totally different one for slotted products, or they stall trying to find the "right" universal format.

**Nudge:** "If you were the client consuming this endpoint, what would you want the response to look like for both product types? There's no single right answer — pick one and tell me the tradeoff."

**If they need more:** "Some teams force everything into a slots array — an inventory product is one all-day slot with a quantity. Others keep a type discriminator and a per-type payload. Either can work."

**Strong candidates, unprompted:** Sketch the shape *before* coding, mention the client's perspective, and record the choice in DESIGN.md.

**When to give:** When they start writing the endpoint with no stated format plan, or when two divergent shapes have already appeared.

---

## Hint 3: The `available: 7` dirty slot

**Sticking point:** Their sync crashes, stores garbage, or silently drops the first spa-001 slot on 2024-03-15 because `available` is a number there and a boolean everywhere else.

**Nudge (light):** "Take a close look at the first slot in the spa-001 payload for March 15th."

**Nudge (heavier):** "The vendor contract types `available` as `boolean | number`. What's your policy for that?"

**Strong candidates, unprompted:** Spot it while reading `mock-api/API.md` or the raw payload, normalize at ingestion (truthy/positive → available), and ideally pin it with a test or a comment. The very best raise it as a data-quality conversation: where should normalization live, and should ingestion reject or coerce?

**When to give:** Only after the bug actually bites them or they've clearly skimmed past it; this is the exercise's best discriminator, so don't give it early.

---

## Hint 4: Handling vendor failure

**Sticking point:** No error handling around the HTTP call — a vendor 503 turns into an unhandled rejection or a bare 500 — or they don't know how to reproduce a failure.

**Nudge:** "The mock API can fail on demand — check the failure-simulation section of `mock-api/API.md`. What should *your* endpoint do when the vendor is down?"

**Strong candidates, unprompted:** Wrap the client call, choose a behavior deliberately (error out with a clean 502/503, serve stale persisted slots, or degrade to internal products only), state the tradeoff, and demo it with `?simulate=failure`.

**When to give:** Once the integration happy path works. If they never bring up failure by ~50 min, trigger it yourself: "The spa vendor just went down — show me what happens." If there's no coding time left, take the answer verbally.

---

## Hint 5: Drowning in the vendor payload

**Sticking point:** They try to persist everything — therapist ratings, amenities, fee fields — and either start altering the schema to fit the vendor or burn time writing a 30-field mapper.

**Nudge:** "Look at what `product_timeslots` and `product_timeslot_details` actually store. Work backwards from those columns — what's the minimum you need from the payload?"

**Strong candidates, unprompted:** Map only startTime/endTime/available plus the detail columns (therapistName → provider_name, therapistId → provider_id, gender, slotId → external_id) and explicitly say the rest is noise they're discarding.

**When to give:** As soon as you see them building types or storage for vendor fields the schema has no home for.

---

## Hint 6: Testing without the flakiness

**Sticking point:** They avoid testing the integration because "it needs the mock server running," or they write a test that makes real HTTP calls and is order-dependent.

**Nudge:** "Have a look at the examples in `tests/` — there's one that stubs the vendor's HTTP API with nock. And the mock API's `?simulate=failure` gives you a deterministic failure if you'd rather go end-to-end."

**Strong candidates, unprompted:** Find the scaffolding themselves, extend the skipped/TODO scaffold, and cover at least the unified endpoint plus one failure or dirty-data case.

**When to give:** If ~50 minutes have passed with no tests and no stated plan for them, or the moment they say they're skipping tests for logistical (not time-prioritization) reasons. Skipping tests as a *stated time tradeoff* is fine in a 60-minute session — ask them to describe what they'd test instead.

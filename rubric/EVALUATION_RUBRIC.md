# Evaluation Rubric — Live Session

Score right after the session. Note which hints you gave (see `HINTS.md`): doing something unprompted scores higher than doing it after a nudge, but responding well to a nudge is itself a positive signal.

**Schema design is NOT scored** — the schema is provided. Schema *understanding and critique* shows up as a discussion signal under Collaboration.

## Integration & Mapping Design (25 points)

- [ ] **Excellent (21–25)**: Clean adapter/client boundary around the vendor API; deliberate serviceId → product mapping decision with stated tradeoffs; maps only what the schema needs and consciously discards the noise; handles the `available: boolean | number` inconsistency deliberately.
- [ ] **Good (15–20)**: Working integration with a reasonable mapping; minor leakage of vendor concepts or an unexamined mapping choice; handles the dirty data after noticing it.
- [ ] **Adequate (9–14)**: Integration works for the happy path but vendor structure bleeds through, or the dirty slot is mishandled/ignored after a nudge.
- [ ] **Poor (0–8)**: Copies vendor payload wholesale, no mapping decision, or integration doesn't work.

## API Response Consistency (20 points)

- [ ] **Excellent (17–20)**: One coherent shape for both product types; a client needn't know the source; format decision explained (and jotted in DESIGN.md).
- [ ] **Good (12–16)**: Mostly consistent with minor asymmetries; decision made but tradeoffs thin.
- [ ] **Adequate (7–11)**: Both types served but shapes diverge enough that clients need per-type logic.
- [ ] **Poor (0–6)**: Different endpoints/shapes per type, or vendor IDs/fields exposed directly.

## Error Handling (15 points)

- [ ] **Excellent (13–15)**: Vendor failure (503 / simulate=failure) degrades gracefully with sensible status codes and messages; internal products unaffected; considers timeouts/stale data; invalid input handled.
- [ ] **Good (9–12)**: Failures caught and surfaced sanely; some edge cases (timeouts, partial data) unexplored.
- [ ] **Adequate (5–8)**: Basic try/catch; vague 500s; only handles failure after prompting.
- [ ] **Poor (0–4)**: Unhandled rejection / crash when the vendor is down.

## Code Quality (15 points)

- [ ] **Excellent (13–15)**: Follows the existing routes/services/repositories structure; strong typing; clear naming; small focused functions.
- [ ] **Good (9–12)**: Generally clean; some `any` types or misplaced logic.
- [ ] **Adequate (5–8)**: Works but disorganized — vendor calls inline in routes, weak typing.
- [ ] **Poor (0–4)**: Hard to follow, everything in one place.

## Testing (10 points)

- [ ] **Excellent (9–10)**: Uses the provided scaffolding unprompted; meaningful tests for the new behavior including at least one failure/dirty-data case; uses nock or `?simulate=failure` for determinism.
- [ ] **Good (6–8)**: Adds happy-path tests for the new behavior; error case discussed but maybe not written (acceptable under time pressure if articulated).
- [ ] **Adequate (3–5)**: Runs the existing tests, writes little; testing only after prompting.
- [ ] **Poor (0–2)**: Ignores tests entirely, breaks the existing suite without noticing.

## Live Collaboration & Communication (15 points)

- [ ] **Excellent (13–15)**: Thinks out loud; asks clarifying questions early (timezones, staleness, mapping ownership); states assumptions; prioritizes well under time pressure — cuts scope deliberately rather than running out of clock; takes nudges and runs with them; offers sharp schema critique when asked.
- [ ] **Good (9–12)**: Communicates when asked; reasonable prioritization; needs occasional redirection.
- [ ] **Adequate (5–8)**: Quiet/hard to follow; poor time allocation (e.g. half the session gold-plating one layer); resists or misuses nudges.
- [ ] **Poor (0–4)**: Can't explain their own decisions; ignores interviewer input; no prioritization.

## Total: 100 points

- **85–100**: Exceptional — strong hire signal
- **70–84**: Strong
- **55–69**: Mixed — weigh which categories carried the score
- **Below 55**: Not at bar for this exercise

Remember to normalize for how far they got — 60 minutes is tight. A candidate who completes tasks 1–2 cleanly and *talks through* failure handling and testing can outscore one who rushed all four.

## Red flags

- Vendor payload persisted wholesale (therapist ratings, room amenities, fee fields in your tables)
- No reaction to the `available: 7` slot even after a direct nudge
- Vendor outage crashes the whole availability endpoint
- Silent, opaque work for long stretches despite prompting
- Breaks provided code/tests and doesn't notice

## Green flags

- Curls the vendor API and reads `mock-api/API.md` before writing code
- Spots the `available: boolean | number` type in the contract before it bites
- Explicit "I'm skipping X because of time; here's what I'd do" moments
- Tests written alongside code, not bolted on at the end
- Thoughtful critique of the provided schema when asked

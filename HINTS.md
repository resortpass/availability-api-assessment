# Hints & Tips

These are optional hints if candidates get stuck. Don't read these unless you're truly blocked!

<details>
<summary>Hint 1: Data Model Strategy</summary>

Consider separating "product catalog" from "availability data":
- A `products` table that holds product metadata
- A `product_sources` table or column that indicates if it's `internal` or `external:spa`
- An `availability` table that can represent BOTH inventory counts and time slots

Think about polymorphism or a flexible JSON column for source-specific details.
</details>

<details>
<summary>Hint 2: Representing Availability</summary>

Two common approaches:

**Approach A: Unified Slots**
- Even inventory products use "slots" (one big slot for the whole day)
- Consistent representation, but feels weird for simple inventory

**Approach B: Flexible Availability Records**
- Inventory products: One record per date with `quantity_available`
- Time-slotted products: Multiple records per date with `time_slot`
- API layer normalizes these into a consistent response

Both work! Document your choice.
</details>

<details>
<summary>Hint 3: 3rd Party Integration</summary>

Use an adapter pattern:
```
[Your API] → [Product Service] → [Availability Service]
                                       ↓
                         ┌─────────────┴─────────────┐
                         ↓                           ↓
                  [Internal Repository]    [External API Adapter]
```

The adapter translates 3rd party data into your internal format.
</details>

<details>
<summary>Hint 4: Error Handling</summary>

What happens when the 3rd party API is down?
- Return cached data?
- Return an error?
- Return partial results (internal products only)?

Document your decision!
</details>

<details>
<summary>Hint 5: Testing</summary>

Don't forget to test:
- Happy path for both product types
- 3rd party API failure (mock server simulates this 10% of the time)
- Invalid dates
- Non-existent product IDs
- Date ranges with no availability

Consider using `nock` or similar to mock HTTP calls in tests.
</details>

<details>
<summary>Hint 6: API Response Format</summary>

Consider a format like:
```json
{
  "productId": "...",
  "productName": "...",
  "date": "2024-03-15",
  "availabilityType": "inventory" | "timeslots",
  "availability": {
    // Structure changes based on type
  }
}
```

Or force everything into a slots array:
```json
{
  "productId": "...",
  "date": "2024-03-15",
  "slots": [
    { "time": "09:00", "available": true },
    // OR
    { "time": "all-day", "available": 35, "capacity": 50 }
  ]
}
```

There's no single right answer!
</details>

## Common Pitfalls

1. **Don't expose 3rd party IDs in your API**
   - Bad: `productId: "spa-001"`
   - Good: `productId: "massage-swedish-60"` (your own ID)

2. **Don't make availability queries N+1**
   - If you need to check 10 products, don't make 10 database queries

3. **Don't forget about timezones**
   - What timezone are these times in?
   - Document your assumption!

4. **Don't over-engineer**
   - You don't need Redis caching for this assessment
   - You don't need microservices
   - Focus on a clean, simple design that works

5. **Do document your tradeoffs**
   - Every design has pros and cons
   - Show you understand them!

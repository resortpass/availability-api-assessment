# Sample Data Examples

This file provides examples of the types of products candidates should support.

## Internal Products (Inventory-Based)

These products have a fixed inventory count per day.

### Example 1: Pool Day Pass
- Product ID: `pool-pass-001`
- Name: "Pool Day Pass - Weekday"
- Inventory: 50 per day
- Date: 2024-03-15
- Available: 35 remaining

### Example 2: Cabana Rental
- Product ID: `cabana-001`
- Name: "Poolside Cabana"
- Inventory: 10 per day
- Date: 2024-03-15
- Available: 3 remaining

### Example 3: Gym Access
- Product ID: `gym-pass-001`
- Name: "Fitness Center Day Pass"
- Inventory: 100 per day
- Date: 2024-03-15
- Available: 87 remaining

## External Products (Time-Slotted)

These come from the 3rd party SPA API (see `mock-api/example-response.json`).

### Example 1: Swedish Massage
- Service ID: `spa-001` (from 3rd party)
- Product ID: ??? (you decide how to map this)
- Name: "60-Minute Swedish Massage"
- Duration: 60 minutes
- Available slots on 2024-03-15: 09:00, 10:00, 14:00, 15:00, 16:30

### Example 2: Deep Tissue Massage
- Service ID: `spa-002` (from 3rd party)
- Product ID: ??? (you decide how to map this)
- Name: "90-Minute Deep Tissue Massage"
- Duration: 90 minutes
- Available slots on 2024-03-15: 09:00, 13:00

### Example 3: Express Facial
- Service ID: `spa-003` (from 3rd party)
- Product ID: ??? (you decide how to map this)
- Name: "30-Minute Express Facial"
- Duration: 30 minutes
- Available slots on 2024-03-15: 10:00, 10:30, 11:00, 14:30, 16:00

## Key Questions to Answer in Your Design

1. **How do you unify these two product types?**
   - Should they share a products table?
   - How do you track which products are external vs internal?

2. **How do you store availability?**
   - For inventory products: Just a number?
   - For time slots: Individual slot records?
   - Can you query both efficiently?

3. **How do you handle the 3rd party mapping?**
   - Do you store a mapping of `spa-001` → your internal product ID?
   - Where does this mapping live?
   - How do you refresh it when the 3rd party adds new services?

4. **What does your API response look like?**
   - How do you represent "35 available" for inventory products?
   - How do you represent specific time slots for spa services?
   - Can a client tell the difference? Should they?

## Expected API Behavior

```bash
# Internal product (inventory-based)
curl http://localhost:3000/api/availability?productId=pool-pass-001&date=2024-03-15

# Should return something like:
{
  "productId": "pool-pass-001",
  "productName": "Pool Day Pass - Weekday",
  "date": "2024-03-15",
  "availability": {
    // Your design here
    // Represents: 35 available out of 50
  }
}

# External product (time-slotted)
curl http://localhost:3000/api/availability?productId=massage-swedish-60&date=2024-03-15

# Should return something like:
{
  "productId": "massage-swedish-60",
  "productName": "60-Minute Swedish Massage",
  "date": "2024-03-15",
  "availability": {
    // Your design here
    // Represents: available at 09:00, 10:00, 14:00, 15:00, 16:30
  }
}
```

The challenge is making both responses use the same structure!

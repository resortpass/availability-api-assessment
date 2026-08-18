# SpaBooking API — v2.1.4

Partner-facing reference for the SpaBooking availability API. This mock instance runs at `http://localhost:3001` (start it with `npm run mock-api`).

All endpoints are read-only `GET` requests. All slot times are in UTC, 24-hour `HH:MM`. By default, the availability endpoints return bookable inventory for the requested date; slots that are already booked may also appear with `available: false`.

## Response envelope

Every response is JSON wrapped in a standard envelope:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

---

## GET /api/services

Returns the full service catalog for the property. No parameters.

```json
{
  "success": true,
  "data": [ { <service object>, ... } ]
}
```

### Service object

| Field | Type | Description |
|---|---|---|
| serviceId | string | Unique service identifier (e.g. `"spa-001"`) |
| serviceName | string | Display name |
| duration | number | Treatment length, minutes |
| price | number | Current price |
| originalPriceBeforeYield | number | List price before yield adjustments |
| currency | string | ISO 4217 code (e.g. `"USD"`) |
| category | string | e.g. `"massage"`, `"facial"` |
| preTime | number | Required arrival buffer before the treatment, minutes |
| afterTime | number | Turnover buffer after the treatment, minutes |
| minAdvanceBooking | number | Minimum booking lead time, minutes |
| maxAdvanceBooking | number | Maximum booking lead time, minutes |
| cancellationPolicy | string | e.g. `"24_HOURS"`, `"48_HOURS"` |
| requiresDeposit | boolean | Whether a deposit is collected at booking |
| depositAmount | number | Deposit amount (0.00 if none) |
| taxRate | number | Applicable tax rate (e.g. `0.08`) |
| serviceLevel | string | `"express"`, `"standard"`, or `"premium"` |

---

## GET /api/availability?date={YYYY-MM-DD}

Returns availability for **all** services on a date.

| Parameter | In | Required | Format |
|---|---|---|---|
| date | query | yes | `YYYY-MM-DD` |

```json
{
  "success": true,
  "data": {
    "provider": "SpaBooking",
    "date": "2024-03-15",
    "services": [
      {
        "serviceId": "spa-001",
        "serviceName": "60-Minute Swedish Massage",
        "duration": 60,
        "price": 120.0,
        "currency": "USD",
        "slots": [ { <slot object>, ... } ]
      }
    ]
  }
}
```

A date with no availability returns `success: true` with an empty `services` array.

---

## GET /api/availability/{serviceId}?date={YYYY-MM-DD}

Returns availability for a single service on a date.

| Parameter | In | Required | Format |
|---|---|---|---|
| serviceId | path | yes | Service identifier from the catalog (e.g. `spa-001`) |
| date | query | yes | `YYYY-MM-DD` |

```json
{
  "success": true,
  "data": {
    "serviceId": "spa-001",
    "serviceName": "60-Minute Swedish Massage",
    "date": "2024-03-15",
    "duration": 60,
    "price": 120.0,
    "currency": "USD",
    "slots": [ { <slot object>, ... } ]
  }
}
```

A valid service with no availability on the date returns `success: true` with an empty `slots` array.

### Slot object

| Field | Type | Description |
|---|---|---|
| slotId | string | Unique slot identifier (e.g. `"SLOT-20240315-0900-T001-SPA001"`) |
| startTime | string | Slot start, UTC `HH:MM` |
| endTime | string | Slot end, UTC `HH:MM` |
| available | boolean \| number | Slot availability |
| therapistId | string | Provider identifier |
| therapistName | string | Provider full name |
| technicianId | string | Legacy alias of `therapistId` |
| firstName | string | Provider first name |
| lastName | string | Provider last name |
| gender | string | Provider gender |
| certifications | string[] | Provider certifications |
| experienceYears | number | Provider years of experience |
| rating | number | Provider rating, 0–5 |
| facilityId | string | Facility identifier |
| facilityName | string | Facility display name |
| roomNumber | string | Assigned room |
| roomType | string | e.g. `"standard"`, `"deluxe"`, `"facial_suite"` |
| floor | number | Facility floor |
| yieldId | string \| null | Active yield-pricing rule, if any |
| yieldMultiplier | number | Price multiplier applied by the yield rule |
| bookingFee | number | Per-booking fee |
| processingFee | number | Payment processing fee |
| specialRequirements | string[] | Requirements for this slot |
| equipmentProvided | string[] | Equipment included |
| amenities | string[] | Room amenities |
| wheelchairAccessible | boolean | Accessibility flag |
| bookingId | string | Present only on booked slots |
| bookedUntil | string | ISO 8601 datetime; present only on booked slots |
| customerNotes | string | Present only on some booked slots |

Note: a provider offering multiple services can expose the same time window under more than one `serviceId`; one provider + time window represents one unit of availability.

---

## Errors

| Status | Condition | Body |
|---|---|---|
| 400 | Missing `date` parameter | `{ "success": false, "error": "Date parameter is required (format: YYYY-MM-DD)" }` |
| 404 | Unknown `serviceId` | `{ "success": false, "error": "Service not found" }` |
| 503 | Service unavailable | `{ "success": false, "error": "Service temporarily unavailable" }` |

Clients should expect intermittent 503s and handle them accordingly.

## Failure simulation (sandbox)

For deterministic testing, both availability endpoints accept:

| Mechanism | Effect |
|---|---|
| `?simulate=failure` query parameter | The request always returns 503 |
| `X-Simulate: failure` request header | Same effect as the query parameter |
| `FAILURE_RATE` environment variable on the mock server (default `0`) | Fraction of availability requests that randomly return 503, e.g. `FAILURE_RATE=0.25` |

```bash
curl "http://localhost:3001/api/availability/spa-001?date=2024-03-15&simulate=failure"
# -> 503 { "success": false, "error": "Service temporarily unavailable" }
```

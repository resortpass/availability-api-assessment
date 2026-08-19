# SpaBooking API — v2.1.4

The mock 3rd-party vendor API. Runs on `http://localhost:3001` (`npm run mock-api`).

## Endpoints

| Endpoint | Inputs |
|---|---|
| `GET /api/services` | — (returns the full service catalog) |
| `GET /api/availability` | `date` — query param, required, `YYYY-MM-DD` |
| `GET /api/availability/:serviceId` | `serviceId` — path param; `date` — query param, required, `YYYY-MM-DD` |

## Response envelope

Every response is wrapped in an envelope:

```json
{ "success": true, "data": ... }
```

or, on failure, with a matching HTTP status:

```json
{ "success": false, "error": "..." }
```

| Status | When |
|---|---|
| 400 | missing or invalid `date` |
| 404 | unknown `serviceId` |
| 503 | vendor outage |

## Failure simulation

- Add `?simulate=failure` (or send an `X-Simulate: failure` header) to either availability endpoint for a guaranteed 503.
- Start the mock server with `FAILURE_RATE=0.3` to make availability requests fail randomly instead (defaults to 0).

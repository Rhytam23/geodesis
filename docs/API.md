# API Design — MEKONG SMART LAND SYSTEM

## Current State (v1.0)

The application is **client-side only**. All data is fetched directly from public APIs or served via deterministic demonstration data.

No authentication is required for v1.0.

---

## Planned Production REST API (v1.1+)

Base URL: `https://api.mekong-smart-land.vn/v1`

### Authentication

All production endpoints require JWT Bearer token.

```
Authorization: Bearer <token>
```

Obtain token via:
- `POST /auth/login`
- Or Vietnamese government SSO integration

---

## Endpoints

### Weather

**GET /weather?lat=10.045&lng=105.746**

**Purpose**: Current + forecast weather for a location.

**Response**:
```json
{
  "source": "Open-Meteo",
  "lastUpdated": "2026-07-03T09:14:00Z",
  "confidence": 91,
  "current": {
    "temp": 28.4,
    "rainfall": 12,
    "humidity": 78
  },
  "forecast": [...]
}
```

### Soil

**GET /soil?lat=10.045&lng=105.746**

**Response**:
```json
{
  "source": "ISRIC SoilGrids v2.0",
  "lastUpdated": "2026-07-03T08:55:00Z",
  "confidence": 82,
  "salinity": 6.8,
  "ph": 5.3,
  "organicMatter": 2.4
}
```

### Satellite

**GET /satellite?lat=...&lng=...&date=2026-07-03**

Returns NDVI, salinity index, etc. (proxied from GEE in future).

### Market

**GET /market?crop=ST25%20Rice&province=Can%20Tho**

### Recommendations

**POST /recommendations**

**Request**:
```json
{
  "lat": 10.045,
  "lng": 105.746,
  "currentCrop": "IR64 Rice"
}
```

**Response**: Array of `CropRecommendation` (see types).

### Economic Analysis

**POST /economic/compare**

Returns full economic model for current vs recommended.

### Government

**GET /government/provinces?risk=High&crop=ST25%20Rice**

Enterprise filtered view.

### Alerts / SMS

**POST /alerts/sms**
```
{
  "recipients": ["+84901234567"],
  "message": "...",
  "priority": "high"
}
```

### Predictions

**GET /predictions?lat=...&lng=...&horizon=90d**

---

## Error Codes

| Code | Meaning                     | HTTP |
|------|-----------------------------|------|
| 400  | Invalid lat/lng or params   | Bad Request |
| 401  | Missing or invalid token    | Unauthorized |
| 404  | Location not supported      | Not Found |
| 429  | Rate limit exceeded         | Too Many Requests |
| 500  | Internal server error       | Server Error |

---

## Validation Rules

- `lat`: -90 to 90
- `lng`: -180 to 180
- All numeric fields validated server-side

---

## OpenAPI / Future

A full OpenAPI 3.1 spec will be published at `/docs/openapi.json` in v1.1.

---

## Client-Side Service Contracts (Current)

See `src/services/*.ts` for exact current interfaces. All services return objects containing:

```ts
{
  source: string;
  lastUpdated: string;
  confidence: number;
  // + domain data
}
```

This contract will be preserved when moving to backend proxies.

---

**Document Version**: 1.0 (2026-07-03)
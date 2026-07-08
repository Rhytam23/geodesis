# Data Pipeline Documentation

## Current Pipeline (v1.0 — Client Side)

```
User selects location
        │
        ▼
useLocationData (parallel)
        │
   ┌────┴────┬────────┬────────┬────────┐
   ▼         ▼        ▼        ▼        ▼
Weather   Soil    Admin   Market   Gov
(Open-Meteo) (SoilGrids) (Nominatim)
   │         │        │        │        │
   └────┬────┴────────┴────────┴────────┘
        ▼
   decisionInput
        │
        ▼
decisionEngine.generateRecommendations()
        │
        ▼
economicService.calculateEconomicComparison()
        │
        ▼
UI components (reactive)
```

## Caching Strategy

- Weather: 10 minutes
- Soil / Admin: 24 hours
- Market: 30 minutes
- All implemented via simple in-memory Map + TTL

## Demonstration Data

All synthetic data in `mockData.ts` and `analysisGenerator.ts` is:
- Deterministic (seeded)
- Explicitly labeled "DEMONSTRATION"
- Based on real province statistics from public MARD/MONRE reports

## Future Production Pipeline (v1.1)

1. **Ingestion**
   - Google Earth Engine (Sentinel-1/2, MODIS)
   - MONRE ground stations
   - MARD market data feeds
2. **Processing**
   - Cloud functions / Airflow
   - Feature store (NDVI, salinity indices, anomalies)
3. **Serving**
   - REST + gRPC endpoints
   - Redis cache layer
4. **Storage**
   - TimescaleDB for time-series
   - PostGIS for spatial

## Data Quality

Every service response includes:
- `source`
- `lastUpdated`
- `confidence`

This metadata propagates all the way to the UI.

---

**Transparency is non-negotiable.**
# API Contract Specification

Geodesis exposes its data models and API schemas through an OpenAPI contract located at `api/openapi.yaml`.

## External Service Adapters

### 1. Open-Meteo Weather API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Method**: `GET`
- **Parameters**: `latitude`, `longitude`, `hourly`, `daily`
- **Fallback**: `buildFallback(lat, lng)` returns climate model baseline values.

### 2. ISRIC SoilGrids v2.0
- **Endpoint**: `https://rest.isric.org/soilgrids/v2.0/properties/query`
- **Method**: `GET`
- **Parameters**: `lon`, `lat`, `property` (phh2o, soc)
- **Fallback**: `buildFallback(lat, lng)` returns regional soil table baselines.

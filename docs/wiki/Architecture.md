# System Architecture

## Overview
Geodesis uses a modular, domain-driven architecture that decouples external telemetry adapters from state orchestration and UI component rendering.

```
                         USER INTERACTION
                (Map Click / Search / Timeline Scrub)
                                 │
                                 ▼
                         STATE ORCHESTRATOR
                       (useGeodesisTwin Hook)
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
WEATHER SERVICE            SOIL SERVICE             ADMIN SERVICE
(Open-Meteo Adapter)     (SoilGrids Adapter)     (Nominatim Geocoder)
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                         DECISION ENGINE
                (5-Factor Explainable Scoring)
                                 │
                                 ▼
                         ECONOMIC MODEL
                 (Profit / ROI / Subsidy Math)
                                 │
                                 ▼
                   REACTIVE COMPONENT RENDERING
```

## Key Modules
- **Services (`src/services/`)**: Integration adapters for weather, soil, administration, crop data, and market pricing.
- **Decision Engine (`src/services/decisionEngine.ts`)**: Evaluates environmental suitability and generates explainable crop advice.
- **Context Providers (`src/context/`)**: Manages demo mode, timeline scrubbing, user role switching, and scenario parameters.

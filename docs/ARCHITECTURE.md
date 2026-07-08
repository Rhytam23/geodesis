# Architecture Overview — MEKONG SMART LAND SYSTEM v1.0

## High-Level Architecture

The platform is a **client-side-first React application** (Vite + TypeScript) with a **map-centric reactive architecture**.

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                       │
├─────────────────────────────────────────────────────────────┤
│  ProfessionalGISMap (Leaflet)                               │
│         ↓ (onClick / search)                                │
│  SmartMap.tsx (orchestrator)                                │
│         ↓                                                   │
│  useLocationData(lat, lng)  ←  Unified reactive hook        │
│         ↓ (parallel)                                        │
│  ┌────────────┬────────────┬────────────┬────────────┐      │
│  │ weather    │ soil       │ admin      │ market     │ ...  │
│  └────────────┴────────────┴────────────┴────────────┘      │
│         ↓                                                   │
│  DecisionIntelligence + EconomicDecision + Dashboards       │
│  (all update reactively)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

1. **Map is the Source of Truth**
   - All modules react to a single `lat/lng` change.
2. **No Black Boxes**
   - Every recommendation carries full explainability metadata.
3. **Modular Services**
   - Services are pure functions + caching. Easy to swap for production APIs.
4. **Graceful Degradation**
   - Live APIs → deterministic demo fallbacks.
5. **Client-Only v1.0**
   - Zero backend required for demos and hackathons.

## Key Modules

### Frontend Layers
- **pages/SmartMap.tsx** — Primary integration point
- **components/ProfessionalGISMap.tsx** — GIS core
- **components/DecisionIntelligence.tsx** — Trust + explanations
- **components/EconomicDecision.tsx** — Economic modeling + charts
- **components/dashboards/** — Role-specific views (shared components)
- **pages/RoleDashboards.tsx** — Unified switcher

### Data Layer
- `src/hooks/useLocationData.ts` — Central data aggregator
- `src/services/*Service.ts` — 8 independent services
- `src/services/decisionEngine.ts` — Explainable AI core
- `src/services/economicService.ts` — Transparent calculations

### State & Context
- `DemoModeContext.tsx` — Global demo overrides (non-intrusive)
- React state + useMemo (no heavy global store needed)

## Data Flow (Location Selection)

1. User clicks map or searches
2. `handleLocationSelect(lat, lng)` called
3. `useLocationData` fires 6 parallel fetches (cached)
4. `decisionInput` object is built
5. `generateRecommendations(input)` → ranked list
6. `calculateEconomicComparison(...)` → economic model
7. All child components re-render with new props

## Decision Engine (Modular)

See [AI_ENGINE.md](./AI_ENGINE.md)

Current implementation uses deterministic weighted scoring. Designed for future replacement by ML (XGBoost/LSTM) without UI changes.

## Economic Calculations

Transparent formulas are surfaced in the UI:

```ts
Revenue = expectedYield * pricePerTon * marketFactor
Profit = Revenue - (variableCosts + fixedCosts)
Payback = investment / (profitDelta)
```

All inputs (live weather, soil, market) are shown to the user.

## Demo Mode Architecture

`DemoModeContext` provides:
- `isDemoMode`
- `currentScenario`
- `demoData` (pre-computed full overrides)

Overrides are applied at the **SmartMap** and **GovernmentDashboard** level using `useMemo`.

## Future Architecture (v1.1+)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  React SPA   │────▶│  Backend API │────▶│  PostgreSQL  │
│  (Vercel)    │     │  (Node/Go)   │     │  + Timescale │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       │             │  GEE / MARD  │
       │             │  + SMS GW    │
       └─────────────┴──────────────┘
```

---

**Status**: v1.0 — Fully functional, production-ready prototype.
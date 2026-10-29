# Architecture Overview — Geodesis

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
5. **Client-First**
   - The map, decision engine, economics and dashboards need no backend. Only the AI features use serverless functions (`api/`).

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

Current implementation uses deterministic weighted scoring in `src/services/decisionEngine.ts`. There is no trained model in this release, and the engine has not been validated against field or yield data. A trained model is a roadmap item.

## AI Layer (Nebius Token Factory + NVIDIA Nemotron)

Two serverless functions in `api/` call Nemotron models on Nebius Token Factory. Keys stay on the server.

- `api/advisor.ts`: single-call explainer with two modes (explain a recommendation, explain a what-if run). Validates the reply and retries once if it contains planning text.
- `api/agent.ts`: the Geodesis Agent, a multi-step workflow that streams its progress as NDJSON.

```
context  -> twin state the user is looking at (simulated)
plan     -> fast Nemotron chooses 2-3 web searches
gather   -> Open-Meteo 16-day forecast  +  Tavily web search   (parallel)
reason   -> largest Nemotron available writes a structured, cited answer
verify   -> code checks JSON, citations, URLs, simulated-data note;
            one repair pass, then a fallback model
```

Model IDs are discovered at runtime from `GET /v1/models` (Ultra, else Super for reasoning; Lightning or Nano for planning) and can be pinned with `NEBIUS_MODEL_FAST` and `NEBIUS_MODEL_DEEP`. Every claim in an agent answer carries a basis (`engine`, `forecast`, `evidence`, `assumption`); only claims backed by a retrieved source may cite it. The agent never changes the simulation or the rule-based recommendation. See `src/types/agent.ts` for the shared contract.

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

**Status**: v1.1 — working demonstration prototype. The twin data is simulated and labelled as such; the AI agent makes live model, search and forecast calls.
# Geodesis

Geospatial digital twin for climate-resilient agriculture in the Vietnamese Mekong Delta.

[![CI](https://github.com/Rhytam23/geodesis/actions/workflows/ci.yml/badge.svg)](https://github.com/Rhytam23/geodesis/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Click the map or move the climate timeline and every metric, recommendation and chart updates: **Location → Scenario → Simulation → Insights → Export**.

## Features

| Feature | Description |
|---------|-------------|
| Interactive GIS map | Leaflet map with satellite, OSM, terrain and dark layers, province boundaries and salinity/NDVI heatmaps |
| Timeline | Scrub 2026–2050; all values react instantly |
| Explainable decision engine | Weighted scoring (weather, soil, market, satellite, history); each number shows its formula, confidence and source |
| Economic modelling | Revenue, cost, profit, ROI, payback and subsidy eligibility |
| Scenario builder | Adjust rainfall, salinity and AWD adoption with live sliders |
| Role dashboards | Farmer, cooperative, government and researcher views |
| AI advisor | Plain-language explanations from NVIDIA Nemotron served on Nebius Token Factory: one for any recommendation, and a what-if explainer for simulation runs (see below) |
| Demo mode | Five deterministic scenarios: normal, flood, drought, high salinity, government response |

## Quick start

```bash
git clone https://github.com/Rhytam23/geodesis.git
cd geodesis
npm install
npm run dev
```

Open <http://localhost:3000/workspace>. No API keys are needed; live data sources fall back to demonstration data if unreachable.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Vitest
npm run ci          # typecheck + lint + test + build
```

## Environment variables

Copy `.env.example` to `.env.local`. `.env.local` is git-ignored; never commit keys.

### AI advisor (Nebius Token Factory + NVIDIA Nemotron)

The advisor runs in a serverless function (`api/advisor.ts`) that calls an OpenAI-compatible chat endpoint on **Nebius Token Factory** with an **NVIDIA Nemotron** model (default `nvidia/Nemotron-3_5-Lightning`). The key stays on the server and never reaches the browser.

It has two modes, both read-only narrative layers on top of the rule-based engine and the simulation:

- **Recommendation explainer** (AI Decision Engine page): "Recommendation / Why / Main risk / Next step".
- **What-if explainer** (workspace, after *Run Simulation*): "Scenario outcome / Why / Main risk / Next step" for the projected years.

Guard rails: request size limit, a per-client rate limit, a timeout, validation that rejects chain-of-thought or planning text with one automatic retry, upstream error details hidden in production, and a fixed note that what-if figures are simulated. The model never changes a recommendation or a simulated number. Without a key, the "Explain" buttons report that the advisor is not configured and everything else works.

| Variable | Description |
|----------|-------------|
| `NEBIUS_API_KEY` | Nebius Token Factory API key (required for the advisor) |
| `NEBIUS_MODEL` | Optional model ID (default `nvidia/Nemotron-3_5-Lightning`) |
| `NEBIUS_BASE_URL` | Optional base URL (default `https://api.tokenfactory.nebius.com/v1`) |

Do not prefix these with `VITE_`. Set them in `.env.local` and run `vercel dev` to try the advisor locally, or add them under Vercel → Project Settings → Environment Variables and redeploy.

## What is real and what is simulated

Geodesis is a demonstration platform and says so in the UI.

| Area | Status |
|------|--------|
| Weather (Open-Meteo), soil (ISRIC SoilGrids), place names (OpenStreetMap Nominatim) | Live calls on the GIS Map page and role dashboards, with labelled demonstration fallbacks |
| Workspace digital twin (map insights, timeline, scenario builder) | Simulated: deterministic, transparent models, not calibrated to field data |
| Satellite-style layers (NDVI, salinity heatmaps, Sentinel/CHIRPS/MODIS-style inputs) | Simulated and labelled as such |
| Decision engine | Rule-based weighted scoring; no trained ML model; not yet validated against field or yield data |
| AI advisor | Real Nemotron calls via Nebius Token Factory; narrative only |

## Hackathon scope (Nebius x NVIDIA)

The map, rule-based engine, economic model and dashboards were started before the hackathon (first commit 2026-07-08). The work done for it is the Nebius/Nemotron advisor (recommendation explainer, what-if explainer, output validation, rate limiting), the coherent what-if simulation model, the honesty pass that labels all simulated data, and the workspace and accessibility fixes. See the git history from 2026-10-27.

## Architecture

```
map click (lat/lng)
   └─ useLocationData        weather, soil, admin, market, crop, government (parallel, cached)
        └─ decisionEngine    crop recommendations with weighted confidence
             └─ economicService   revenue / cost / profit / payback / subsidy
                  └─ UI panels update reactively
```

All business values flow through `useGeodesisTwin`.

## Project structure

```
src/
  components/   workspace, dashboards, shared UI, map
  context/      demo mode, role, timeline, scenario, UI state
  hooks/        useGeodesisTwin, useLocationData
  integrations/ simulation, decision, map adapters
  pages/        route-level pages
  services/     decision engine, economics, API clients, AI advisor
  types/        TypeScript interfaces
api/            advisor function + OpenAPI spec
tests/          Vitest tests
docs/           architecture, developer guide, deployment
```

## Tech stack

React 18, TypeScript 5, Vite 5, Leaflet, Recharts, Tailwind CSS, Framer Motion, React Router 6, Vitest.

## Data sources

| Service | Purpose | Key |
|---------|---------|-----|
| [Open-Meteo](https://open-meteo.com) | Weather | none |
| [ISRIC SoilGrids](https://rest.isric.org) | Soil properties | none |
| [OpenStreetMap Nominatim](https://nominatim.org) | Reverse geocoding (1 req/sec) | none |

## Deployment

```bash
vercel                      # Vercel CLI
docker-compose up --build   # Docker, http://localhost:8080
npm run build               # static output in dist/
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Developer guide](./docs/DEVELOPER_GUIDE.md)
- [User guide](./docs/USER_GUIDE.md)
- [Roadmap](./docs/ROADMAP.md)
- [OpenAPI spec](./api/openapi.yaml)

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md). Report vulnerabilities as described in [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)

# Geodesis

> **Geospatial Digital Twin for Climate-Resilient Agriculture**

[![CI](https://github.com/your-org/geodesis/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/geodesis/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev)

Geodesis is a **map-first, AI-powered geospatial digital twin** for the Vietnamese Mekong Delta. It delivers an immersive **Location → Scenario → Simulation → Insights → Export** experience that reacts in real time as you explore the map or scrub the climate timeline.

**Built for:**
- 🌾 Farmers & Cooperatives
- 🏛️ Government analysts (MARD, MONRE)
- 🔬 Researchers
- 🏆 Hackathon demonstrations & portfolio showcase

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Interactive GIS Map** | Leaflet-powered with Satellite, OSM, Terrain, and Dark base layers; province/district boundaries; salinity & NDVI heatmaps; click-to-select with flyTo animation |
| **Live Digital Twin** | Timeline scrubber (2026–2050): every metric, recommendation, and chart reacts instantly as you move through time |
| **Explainable AI Engine** | 5-factor weighted scoring (weather, soil, market, satellite, historical) — every number carries its formula, confidence, and source |
| **Economic Modelling** | Revenue / Cost / Profit comparison, ROI, payback period, subsidy eligibility, co-operative proximity |
| **Scenario Builder** | Adjust rainfall, salinity, and AWD adoption with live sliders; run simulation to update the full twin |
| **Role Dashboards** | Dedicated views for Farmer, Cooperative, Government (enterprise command centre), Researcher |
| **Demo Mode** | 5 deterministic scenarios (Normal, Flood, Drought, High Salinity, Government Response) — perfect for live demos |
| **Transparent Data** | Every value carries: source, confidence %, last updated, and known limitations |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/geodesis.git
cd geodesis

# 2. Install
npm install

# 3. Start dev server
npm run dev
```

Open **[http://localhost:3000/workspace](http://localhost:3000/workspace)** — the Workspace is the primary experience.

> No API keys are required. Live APIs fall back gracefully to demonstration data.

---

## 📦 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 (code-split bundles) |
| Map | Leaflet 1.9 + React-Leaflet 4 |
| Charts | Recharts 2 |
| Styling | Tailwind CSS 3 + design tokens |
| Animation | Framer Motion 11 |
| State | React Context + custom hooks |
| Routing | React Router 6 |
| Toasts | Sonner |
| Deployment | Vercel (recommended) / Docker / static |

---

## 🏗️ Architecture

```
User clicks map (lat/lng)
        │
        ▼
useLocationData(lat, lng)          ← 6 parallel service calls (cached)
  ├── weatherService  → Open-Meteo API
  ├── soilService     → ISRIC SoilGrids
  ├── adminService    → Nominatim (OSM)
  ├── marketService   → MARD/VFA data (demonstration)
  ├── cropService     → local crop database
  └── governmentService → provincial programs
        │
        ▼
decisionEngine.generateRecommendations(input)
  → 4 crops × 7 factors × weighted confidence
        │
        ▼
economicService.calculateEconomicComparison(...)
  → revenue / cost / profit / payback / subsidy
        │
        ▼
All UI panels update reactively (no page reload)
```

**Core principle**: All business values flow through `useGeodesisTwin`. No hardcoded numbers in the UI.

---

## 📁 Project Structure

```
geodesis/
├── src/
│   ├── components/
│   │   ├── workspace/           # Digital Twin workspace components
│   │   │   ├── layout/          # TopNavigation, WorkspaceLayout
│   │   │   ├── map/             # Map panel
│   │   │   ├── right-panel/     # Insights + details panel
│   │   │   ├── sidebar/         # Location, scenario, timeline panels
│   │   │   └── timeline/        # Year scrubber
│   │   ├── dashboards/          # Role-specific dashboards
│   │   ├── shared/              # Shared UI components
│   │   ├── ProfessionalGISMap.tsx
│   │   ├── DecisionIntelligence.tsx
│   │   ├── EconomicDecision.tsx
│   │   └── ErrorBoundary.tsx
│   ├── context/
│   │   ├── DemoModeContext.tsx   # 5 demo scenarios
│   │   ├── RoleContext.tsx       # Role-based access
│   │   ├── WorkspaceProviders.tsx
│   │   ├── TimelineContext.tsx
│   │   ├── ScenarioContext.tsx
│   │   ├── UIContext.tsx
│   │   └── WorkspaceContext.tsx
│   ├── hooks/
│   │   ├── useGeodesisTwin.ts   # Central twin orchestration
│   │   └── useLocationData.ts   # Data fetching hook
│   ├── integrations/            # Adapters (simulation, decision, map)
│   ├── pages/                   # Route-level page components
│   ├── services/                # Deterministic engines + API clients
│   │   ├── decisionEngine.ts    # Explainable AI core (never modify lightly)
│   │   ├── economicService.ts   # Financial modelling
│   │   ├── weatherService.ts    # Open-Meteo client
│   │   ├── soilService.ts       # SoilGrids client
│   │   ├── adminService.ts      # Nominatim client
│   │   ├── marketService.ts     # Market prices
│   │   ├── cropService.ts       # Crop database
│   │   └── governmentService.ts # Provincial programs
│   ├── types/                   # TypeScript interfaces
│   ├── data/                    # Static mock data + generators
│   ├── layouts/                 # Shell layouts (MainLayout)
│   └── styles/                  # Design tokens
├── docs/                        # Public documentation
├── api/                         # OpenAPI specification
├── tests/                       # Test scaffold
├── scripts/                     # Deployment helpers
├── .github/
│   ├── workflows/ci.yml         # CI pipeline
│   ├── ISSUE_TEMPLATE/          # Bug, feature, data issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── .env.example                 # Environment variable reference
├── Dockerfile                   # Multi-stage production Docker image
├── docker-compose.yml           # Local Docker setup
├── vercel.json                  # Vercel deployment config + security headers
├── vite.config.ts               # Build + code splitting config
└── tailwind.config.js           # Design system tokens
```

---

## 🛠️ Development

### Commands

```bash
npm run dev           # Dev server (http://localhost:3000)
npm run build         # Production build
npm run typecheck     # TypeScript check only
npm run lint          # ESLint
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier
npm run ci            # Full CI gate (typecheck + lint + build)
npm run preview       # Preview production build
```

### Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
cp .env.example .env.local
```

All APIs are free and work without keys. See `.env.example` for full documentation.

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Import from GitHub
# https://vercel.com/new → Import Repository
```

Set any required environment variables in the Vercel dashboard.

### Docker

```bash
docker-compose up --build
# Access at http://localhost:8080
```

### Static (any host)

```bash
npm run build
# Upload dist/ to any static host (Netlify, GitHub Pages, S3, nginx)
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture and data flow |
| [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | Developer onboarding and patterns |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | End-user guide by role |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Vercel, Docker, static deployment |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Feature roadmap |
| [api/openapi.yaml](./api/openapi.yaml) | Machine-readable OpenAPI spec |

---

## 🔌 External APIs

| Service | Purpose | Key Required | Free Tier |
|---------|---------|-------------|-----------|
| [Open-Meteo](https://open-meteo.com) | Real-time weather | ❌ No | ✅ Unlimited |
| [ISRIC SoilGrids v2.0](https://rest.isric.org) | Soil properties | ❌ No | ✅ Unlimited |
| [OpenStreetMap Nominatim](https://nominatim.org) | Reverse geocoding | ❌ No | ✅ 1 req/sec |

All APIs fall back to deterministic demonstration data if unavailable.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

**Priority contributions:**
- Real MARD / MONRE data integration
- Google Earth Engine satellite scripts
- Vietnamese language (vi) UI support
- Unit tests for `decisionEngine.ts`
- Mobile PWA improvements

---

## 🗺️ Roadmap

**v1.1 (planned)**
- Backend REST API layer (Node.js / Go)
- Real SMS gateway (VNPT / Twilio)
- Google Earth Engine direct ingestion
- Authentication & user profiles
- Offline support + PWA
- Vietnamese UI language toggle
- Expanded crop models

See [docs/ROADMAP.md](./docs/ROADMAP.md) for details.

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) to report vulnerabilities responsibly.

---

## 📄 License

[MIT](./LICENSE) — © 2026 Geodesis Team

---

*Satellite intelligence. Transparent reasoning. Instant understanding.*

> **Note**: This repository contains only production code and public documentation. Internal engineering artifacts, sprint plans, and AI workflow guides are in the private master repository (never committed here).
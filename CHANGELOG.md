# Changelog

All notable changes to the MEKONG SMART LAND SYSTEM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-07-08

### Added
- TypeScript type definitions file (`src/vite-env.d.ts`) to provide environment variable type definitions (`import.meta.env`) and resolve build type check issues.
- Comprehensive ESLint configuration (`.eslintrc.cjs`) enforcing React Hooks dependencies, React Refresh best practices, and code consistency.
- Proper `.gitignore` to prevent committing node_modules, build outputs, local env files, and private workspace resources.
- Optimized Rollup manual chunks splitting configuration in `vite.config.ts` separating Recharts, React, Leaflet, and Framer Motion to prevent large bundle warning.
- Production-grade security headers in `vercel.json` including Content-Type-Options, Frame-Options, XSS protection, Referrer policy, and HSTS.

### Fixed
- Build warning regarding mixed dynamic and static import of `mockData.ts` by refactoring `adminService.ts` to statically import fallback data.
- Multiple React Hooks dependencies warnings and fast-refresh issues in components and contexts.
- Restructured `ErrorBoundary` to safely suppress detailed stack traces in production environment while exposing them in development mode.

## [1.0.0] - 2026-07-03

### Added
- **Core Platform**
  - Professional interactive GIS map (Leaflet) with OSM, Satellite, Terrain, Dark base layers
  - Province / District / Commune boundaries + dynamic heatmaps
  - Full location-driven reactivity: map click/search → all panels update
- **Data Services** (modular, live + fallback)
  - `weatherService.ts` — Open-Meteo (real)
  - `soilService.ts` — SoilGrids v2.0 (real)
  - `adminService.ts` — Nominatim (real)
  - `cropService`, `marketService`, `governmentService`
- **Decision Intelligence Engine**
  - Fully transparent multi-factor scoring
  - Weather, Soil, Market, Historical, Satellite influences
  - Water Analysis + Risk Assessment per recommendation
  - Confidence breakdown + calculation formula
- **Economic Decision Module**
  - Current vs Recommended crop comparison
  - Revenue / Cost / Profit, Profit increase, Investment, Payback, Subsidy, Coop
  - Bar, Pie, Line charts (Recharts)
- **Role Dashboards** (instant client-side switcher)
  - Farmer, Cooperative, Government (Enterprise Command Center), Researcher
- **Demo Mode** (5 scenarios)
  - Normal Season, Flood Warning, Drought, High Salinity, Government Response
  - Fully reactive across SmartMap, GovernmentDashboard, LiveOps, AI Engine
- **User Trust & Explainability**
  - Every recommendation includes: Confidence, Supporting datasets, 5 influences, Water analysis, Risk assessment, Uncertainty, Expected Benefit, Known Limitations, Last Updated
  - Expandable "Why this recommendation?" panel
  - Low-confidence warnings
- **Live Operations + SMS Preview**
- **Data Audit**
  - All critical values now deterministic or API-backed
  - Explicit "DEMONSTRATION DATA" labels + Source/Last Updated/Confidence everywhere
- **UX / Quality**
  - ErrorBoundary, Skeleton loaders, LoadingStates
  - Responsive, accessible, professional enterprise styling
  - Memoization + performance optimizations

### Changed
- Unified role dashboards into `RoleDashboards.tsx` (no page reloads)
- Removed duplicate dashboard files under `src/pages/dashboards`
- All services now return `source`, `lastUpdated`, `confidence`
- `useLocationData` hook centralizes all fetches

### Fixed
- Duplicate dashboard imports and routes
- Several TypeScript strict issues
- Build warnings cleaned
- Random values removed from core paths (decision engine, services, map)

### Documentation
- Full README
- Initial docs/ folder structure
- In-app Documentation page

---

## [0.9.0] - Pre-release (2026-06)

- Initial SmartMap integration
- Basic decision engine + economic module
- Government dashboard prototype
- DemoModeContext scaffolding

---

## [Unreleased]

### Planned for v1.1
- Backend REST API layer
- Real SMS gateway integration
- Google Earth Engine direct ingestion
- Authentication & user profiles
- Offline support + PWA
- Expanded crop models (more Mekong varieties)
- Vietnamese UI language toggle

---

**Project started**: Early 2026 as a hackathon prototype for Vietnamese agriculture climate resilience.
# Developer Guide — MEKONG SMART LAND SYSTEM

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Toasts**: Sonner
- **Icons**: Lucide React

## Project Conventions

- **No redesigns** — preserve colors, spacing, card styles
- **Map-first reactivity** via `useLocationData`
- **Services are pure** — no side effects except caching
- **Every dataset** must expose `source`, `lastUpdated`, `confidence`
- **Demo data** must be labeled

## Key Files to Know

| Path | Responsibility |
|------|----------------|
| `src/pages/SmartMap.tsx` | Main orchestrator |
| `src/components/ProfessionalGISMap.tsx` | GIS engine |
| `src/services/decisionEngine.ts` | AI brain |
| `src/services/economicService.ts` | Economic models |
| `src/hooks/useLocationData.ts` | Data hub |
| `src/context/DemoModeContext.tsx` | Demo overrides |

## Adding a New Data Source

1. Create `src/services/myNewService.ts`
2. Export a function that returns `{ data, source, lastUpdated, confidence }`
3. Add it to `useLocationData.ts`
4. Update types if needed
5. Surface `DataBadge` in UI

## Extending the Decision Engine

Edit only `decisionEngine.ts`.

Add new scoring functions following the existing pattern:

```ts
function calculateMyNewFactor(...) { ... }
```

Then include it in the confidence calculation and influences.

## Working with Demo Mode

To add a new scenario:

1. Edit `src/context/DemoModeContext.tsx`
2. Add entry to `SCENARIO_CONFIGS`
3. Provide complete `buildDemoData(...)` override

## Running Tests (Future)

```bash
# When tests are added
npm test
```

Currently we rely on:
- `npm run build`
- Manual end-to-end verification on map interactions

## Common Tasks

### Update a crop model
→ `decisionEngine.ts` + `economicService.ts`

### Add a new layer to the map
→ `ProfessionalGISMap.tsx`

### Improve Government dashboard
→ `components/dashboards/GovernmentDashboard.tsx`

### Add a new role dashboard
→ Create new component in `components/dashboards/`, register in `RoleDashboards.tsx`

## Build & Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Debugging

- Open DevTools → Network tab to see real API calls
- Use the in-app Demo Mode for stable data
- All services log source + confidence in console in development

---

**Maintained for contributors and future production teams.**
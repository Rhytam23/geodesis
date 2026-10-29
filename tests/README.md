# Testing

```bash
npm test            # Vitest, runs everything in tests/
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint, zero warnings allowed
npm run ci          # typecheck + lint + test + build
```

CI (`.github/workflows/ci.yml`) runs the same checks on Node 20 and 22.

## What is covered

| File | What it checks |
|------|----------------|
| `agentApi.test.ts` | The Geodesis Agent function: request parsing and clamping, model discovery and fallback, planner parsing, forecast and search merging, answer verification (citations, URLs, confidence cap, simulated and out-of-scope notes), and the full streamed workflow with `fetch` mocked for Nebius, Tavily and Open-Meteo, including repair, fallback and failure paths |
| `agentClient.test.ts` | The browser client for the agent: NDJSON stream parsing across chunk boundaries, error mapping, and building the agent context from the workspace state |
| `advisorApi.test.ts` | The advisor function: output validation that rejects planning text, retry, rate limiting, key normalisation, hiding upstream detail in production, and the two modes |
| `aiAdvisor.test.ts` | The advisor client: request fields, success path, server error codes |
| `decisionEngine.test.ts` | Recommendations sorted by confidence, valid confidence range, high-salinity adaptation, explainability fields present, deterministic output |
| `simulation.test.ts` | The what-if model: a drought lowers yield and keeps falling, more salinity lowers yield and raises risk, AWD saves water, results are monotonic across three consecutive years |

No test calls a real network service: model, search and weather calls are mocked. The live behaviour is checked separately with `node scripts/eval-agent.mjs <url>`, which spends real credits.

## Not covered

- React components (no component or end-to-end tests yet; the UI is checked by hand)
- The map, dashboards and data services beyond the decision engine and simulation model

## Manual QA checklist

- [ ] Map click updates all panels
- [ ] Search by name or lat,lng works
- [ ] Demo scenarios update weather, soil, recommendations, economics and the government dashboard
- [ ] Low-confidence warnings appear correctly
- [ ] All "Why this recommendation?" panels expand
- [ ] Timeline drags and responds to the arrow keys
- [ ] Ask the agent: the run trace fills in, sources are clickable, Escape closes the drawer
- [ ] Production build succeeds cleanly
- [ ] Responsive on mobile

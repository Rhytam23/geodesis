# Testing

## Current Status (v1.0)

No automated test suite yet. The project relies on:

- TypeScript compilation (`tsc --noEmit`)
- Successful production build (`npm run build`)
- Manual verification of core flows (map → recommendations → economic)

## Planned Test Strategy (v1.1)

### Unit Tests
- `decisionEngine.test.ts` — scoring functions, confidence math, edge cases
- `economicService.test.ts` — transparent calculations
- Service fallbacks

### Integration
- `useLocationData` hook tests (mocked APIs)
- Demo mode override correctness

### E2E (Playwright / Cypress)
- Full location selection flow
- Demo Mode scenario switching
- Government dashboard export

### Run (when implemented)
```bash
npm test
npm run test:e2e
```

## Manual QA Checklist

- [ ] Map click updates all panels
- [ ] Search by name / lat,lng works
- [ ] Demo scenarios update Weather, Soil, Recs, Economic, Gov dashboard
- [ ] Low-confidence warnings appear correctly
- [ ] All "Why this recommendation?" panels expand
- [ ] Build succeeds cleanly
- [ ] Responsive on mobile

---

**Goal**: Reach 70%+ coverage on decision-critical logic before v1.1.
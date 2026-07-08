## Summary

<!-- One paragraph: what does this PR do and why? -->

## Related Issue(s)

Closes #<!-- issue number -->

## Type of Change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (existing behaviour changes)
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] Data / science improvement

## Changes Made

<!-- List the files changed and what was done. -->

- 
- 

## Architecture Rules Followed

- [ ] Decision logic lives in `src/services/decisionEngine.ts` — UI contains no hardcoded values
- [ ] New data includes `source`, `lastUpdated`, `confidence` fields
- [ ] Map remains the primary interface (not changed or degraded)
- [ ] Demo Mode overrides live in `DemoModeContext` only
- [ ] Extending existing services/hooks rather than adding new files (where possible)

## Testing

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes (zero TypeScript errors)
- [ ] Manually tested: map click → recommendations → economic comparison flow
- [ ] Demo Mode: all 5 scenarios still work correctly
- [ ] Mobile viewport checked

## Screenshots / Recording

<!-- If UI changed, include before/after screenshots or a screen recording. -->

## Notes for Reviewer

<!-- Anything unusual, assumptions made, or areas that need close review. -->

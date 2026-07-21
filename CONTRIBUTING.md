# Contributing to Geodesis

Thank you for your interest in contributing to Geodesis — a geospatial digital twin for climate-resilient agriculture in the Vietnamese Mekong Delta.

> We aim to help Vietnamese farmers, cooperatives, and government agencies make better climate decisions. Every contribution, no matter how small, matters.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Architecture Rules](#architecture-rules)
- [Commit Convention](#commit-convention)
- [PR Process](#pr-process)
- [Areas Needing Help](#areas-needing-help)
- [Questions?](#questions)

---

## Code of Conduct

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/Rhytam23/geodesis/issues) first.
2. Use the **Bug Report** template when opening a new issue.
3. Include: steps to reproduce, expected vs actual behaviour, browser, OS, and whether Demo Mode was active.

### Suggesting Features

1. Open an issue with the `enhancement` label.
2. Describe the use case — which user role benefits? (Farmer / Cooperative / Government / Researcher)
3. Reference any real-world data, MARD policies, or agronomic constraints.

### Data / Science Issues

If you find an incorrect crop recommendation, economic calculation, or agronomic value, open a **Data Issue** — these are especially valuable. Reference an official source (MARD, SoilGrids, Open-Meteo) showing the expected value.

### Pull Requests

1. Fork the repository and create a descriptive branch:
   ```bash
   git checkout -b feat/shrimp-rice-improved-yield-model
   git checkout -b fix/salinity-tolerance-boundary
   git checkout -b docs/update-deployment-guide
   ```
2. Make focused, atomic changes (one concern per PR).
3. Ensure the build passes: `npm run ci`
4. Update documentation if your change affects behaviour or architecture.
5. Submit the PR using the provided template.

---

## Development Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Getting Started

```bash
# 1. Clone
git clone https://github.com/Rhytam23/geodesis.git
cd geodesis

# 2. Install
npm install

# 3. Start dev server
npm run dev
# Opens at http://localhost:3000
```

### Useful Commands

```bash
npm run dev           # Start dev server (hot reload)
npm run build         # Production build
npm run typecheck     # TypeScript check (no emit)
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier format
npm run format:check  # Prettier check (CI)
npm run ci            # Full CI gate: typecheck + lint + build
npm run preview       # Preview production build locally
```

### Verifying Your Change

Before submitting a PR, run the full gate:

```bash
npm run ci
```

Then manually verify:

- [ ] Map click updates all panels (weather, soil, recommendations, economics)
- [ ] All 5 Demo Mode scenarios still work correctly
- [ ] Build has no TypeScript errors

---

## Architecture Rules

These rules must be followed in all PRs:

| Rule | Why |
|------|-----|
| Decision logic lives in `src/services/decisionEngine.ts` | No hardcoded values in UI |
| Economic calculations in `src/services/economicService.ts` | Single source of truth |
| Map component (`ProfessionalGISMap.tsx`) is not modified without strong justification | It is the primary interface |
| Demo overrides live in `DemoModeContext` only | No demo data leaks into production paths |
| All new data includes `source`, `lastUpdated`, `confidence` | Explainability & trust |
| Extend existing services/hooks before creating new files | Prevents fragmentation |
| No `console.log` in production code | Use `import.meta.env.DEV` guards |

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples**:
```
feat(economic): add payback period chart for shrimp-rice rotation
fix(salinity): correct tolerance boundary at 7 dS/m threshold
docs(api): update OpenAPI spec with /recommendations endpoint
perf(map): lazy-load GovernmentDashboard component
```

---

## PR Process

1. All PRs must pass the CI pipeline (typecheck → lint → build).
2. At least one maintainer review is required before merging.
3. Squash merge into `main` to keep history clean.
4. The PR template checklist must be fully completed.

---

## Areas Needing Help

**High Priority**
- Real MARD / MONRE data integration
- Google Earth Engine satellite ingestion scripts
- SMS gateway (VNPT / Twilio) for farmer alerts
- Mobile-first PWA improvements
- Vietnamese language (`vi`) UI toggle

**Good First Issues** (label: `good first issue`)
- Additional Mekong Delta crop varieties in the decision engine
- More realistic economic assumptions from field data
- Accessibility (WCAG 2.1 AA) audit & fixes
- Unit tests for `decisionEngine.ts` scoring functions
- Improved loading skeleton states

---

## Questions?

Open an issue or start a [GitHub Discussion](https://github.com/Rhytam23/geodesis/discussions).

Thank you for helping Vietnamese farmers adapt to climate change. 🌾

---

**Maintainers**: The Geodesis Team (2026)
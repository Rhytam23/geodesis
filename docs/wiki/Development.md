# Development Guide

## Available Scripts

```bash
npm run dev           # Start Vite development server
npm run build         # Build production bundle with TypeScript checks
npm run typecheck     # Run TypeScript type check
npm run lint          # Run ESLint check
npm run lint:fix      # Auto-fix ESLint issues
npm test              # Run Vitest unit test suite
npm run ci            # Full CI pipeline run locally
```

## Adding a Service Adapter
When integrating a new API endpoint:
1. Create a service file under `src/services/yourService.ts`.
2. Wrap external calls in a `try/catch` block.
3. Provide a deterministic fallback function if the network request fails or times out.
4. Export clear TypeScript types for the returned data structure.

# Deployment Guide — Geodesis

## Local Development

```bash
npm install
npm run dev
```

`npm run dev` also serves the serverless functions in `api/`. To try the AI features locally, copy `.env.example` to `.env.local`, add `NEBIUS_API_KEY` (and optionally `TAVILY_API_KEY`), and restart the dev server.

## Production Build

```bash
npm run build
# Output in /dist
```

## Vercel (recommended)

1. Connect the GitHub repo to Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. Under Project Settings, Environment Variables, add for **Production**:
   - `NEBIUS_API_KEY` (required for the AI features)
   - `TAVILY_API_KEY` (optional; enables web evidence in the agent)
   - `NEBIUS_MODEL_FAST` / `NEBIUS_MODEL_DEEP` (optional; pin the planner and reasoning models)
4. Deploy. Vercel applies environment variables only to new deployments, so redeploy after changing them.

`vercel.json` gives `api/agent.ts` a 60-second budget; the agent stops itself before that and falls back to a smaller model if the large one is slow.

Without `NEBIUS_API_KEY` the AI buttons report that the feature is not configured and everything else works. Without `TAVILY_API_KEY` the agent skips web search and never labels a claim as web evidence.

## Docker

```bash
docker build -t geodesis .
docker run -p 8080:80 geodesis
```

Or with compose:

```bash
docker-compose up --build
```

The Docker image serves the static build only; the AI functions in `api/` run on Vercel.

## GitHub Actions

CI runs on every push and pull request:
- TypeScript check
- Lint
- Unit tests
- Full production build

See `.github/workflows/ci.yml`.

## Verifying a deployment

```bash
node scripts/eval-agent.mjs https://your-deployment.example
```

This runs eight fixed cases against the live agent (real model and search calls) and prints success, latency, models, sources and citation validity.

## Production hardening checklist

- [ ] Add real authentication
- [ ] Replace the in-memory rate limit with a durable one (or a platform firewall)
- [ ] Set spend limits on the Nebius and Tavily accounts
- [ ] Enable CSP headers
- [ ] Set up monitoring (Sentry / Datadog)
- [ ] Configure a CDN for static assets
- [ ] Set up automated dependency updates

## Monitoring recommendations

- Track agent latency and the share of runs that fall back to the smaller model
- Monitor the rate of live vs demonstration-data fallbacks on the data services
- Watch Nebius and Tavily credit balances

# Deployment Guide — MEKONG SMART LAND SYSTEM

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
# Output in /dist
```

## Vercel (Recommended for Hackathons)

1. Connect GitHub repo to Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

Environment variables can be set in Vercel dashboard.

## Docker

```bash
docker build -t mekong-smart-land .
docker run -p 8080:80 mekong-smart-land
```

Or with compose:

```bash
docker-compose up --build
```

## GitHub Actions

CI runs on every push:
- TypeScript check
- Lint
- Full production build

See `.github/workflows/ci.yml`

## Environment Setup

Always start from `.env.example`

## Production Hardening Checklist

- [ ] Add real authentication
- [ ] Proxy all data services through backend
- [ ] Enable CSP headers
- [ ] Set up monitoring (Sentry / Datadog)
- [ ] Configure CDN for static assets
- [ ] Add rate limiting
- [ ] Set up automated dependency updates

## Monitoring Recommendations

- Track map click → recommendation latency
- Monitor API fallback rate (live vs demo)
- Track demo mode usage during presentations

---

**v1.0 is ready for immediate deployment.**
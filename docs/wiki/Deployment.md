# Deployment Guide

## 1. Vercel Deployment (Recommended)
1. Push repository to GitHub.
2. Import repository in [Vercel Dashboard](https://vercel.com/new).
3. Set Framework Preset to **Vite**.
4. Configure optional environment variables in Vercel project settings.

## 2. Docker Deployment
A multi-stage Dockerfile is provided at `Dockerfile`:

```bash
# Build & start container
docker-compose up --build -d

# View logs
docker-compose logs -f
```

Application serves at `http://localhost:8080`.

## 3. Static Web Server (Nginx, S3, Netlify)
```bash
npm run build
```
Deploy the contents of `dist/` to any static web host. Make sure SPA fallback routing redirects all paths to `dist/index.html`.

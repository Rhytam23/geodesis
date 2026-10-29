# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| < 1.1   | No        |

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's private vulnerability reporting for this repository (Security tab, "Report a vulnerability") if it is enabled, or contact the maintainer through their GitHub profile (<https://github.com/Rhytam23>).

Include a description, steps to reproduce, the potential impact and any suggested fix. This is a small hackathon-stage project, so response times are goals rather than guarantees: acknowledgement within a few days, a first assessment within two weeks.

## Security posture of this release

Implemented:
- **Secrets stay on the server.** `NEBIUS_API_KEY` and `TAVILY_API_KEY` are read only by the serverless functions in `api/` and never reach the browser bundle. `.env.local` is git-ignored.
- **Request hardening** on `api/advisor.ts` and `api/agent.ts`: body size limits, input validation and clamping, a per-IP rate limit, upstream timeouts, and upstream error details hidden in production.
- **Untrusted web content.** The agent treats search results as untrusted text, never executes anything a model returns, and only links URLs that came from the search provider. Model output is validated before it is shown.
- No user data is stored by the server. External data calls use public services (Open-Meteo, SoilGrids, Nominatim, Tavily, Nebius Token Factory).

Known limitations:
- The rate limit is in memory per serverless instance. It blunts casual abuse but is not a hard quota; use a platform firewall for that.
- There is no authentication or authorisation layer. The demo is public by design.
- The agent spends Nebius and Tavily credits when used, so keep spend limits on both accounts.
- Dependencies (Leaflet, Recharts and others) should be monitored; Dependabot is recommended.

Recommended before any real-world use: authentication, a durable rate limit, a Content Security Policy (HSTS and other headers are already set in `vercel.json`), dependency scanning and an independent security review.

## Data privacy

- No personal farmer data is collected in demo mode.
- Location queries are not logged by the application.
- Coordinates and the question text are sent to Nebius Token Factory, Tavily and Open-Meteo when the agent runs. Do not enter personal information.
- Before integrating real SMS or user profiles, ensure compliance with GDPR and Vietnamese data protection law.

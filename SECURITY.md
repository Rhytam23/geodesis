# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Full support    |
| < 1.0   | ❌ No longer supported |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in the MEKONG SMART LAND SYSTEM, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities.
2. Email: security@mekong-smart-land.example.com (or open a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix release**: Critical vulnerabilities patched within 14 days

## Security Considerations for v1.0

This is a **client-side heavy prototype**. Current security posture:

### ✅ Implemented
- No hardcoded secrets in source
- Client-side only (no user data stored server-side)
- Error boundaries prevent full app crashes
- Input validation on location selection & search
- All external API calls use public, rate-limited services (Open-Meteo, SoilGrids, Nominatim)
- Demo mode is deterministic and isolated

### ⚠️ Known Limitations (v1.0)
- No authentication / authorization layer yet
- No rate limiting on client-side API calls
- All data services fall back to demonstration datasets
- No server-side validation (when backend is added)
- Leaflet / Recharts dependencies should be monitored

### Recommended Production Hardening
- Add OAuth2 / JWT authentication (Auth0, Clerk, or Vietnamese gov SSO)
- Backend proxy for all external data services
- Input sanitization + CSRF protection
- Content Security Policy (CSP)
- HTTPS + HSTS
- Dependency scanning (Dependabot / Snyk)
- Regular penetration testing

## Data Privacy

- No personal farmer data is collected in demo mode.
- Location queries are ephemeral (not logged).
- When integrating real SMS / user profiles, ensure GDPR / Vietnamese data protection compliance.

## Dependencies

We regularly audit:
- `leaflet`, `react-leaflet`
- `recharts`
- `framer-motion`
- All dev dependencies

Report any dependency vulnerabilities via the process above.

---

**Last updated**: 2026-07-03 (v1.0)
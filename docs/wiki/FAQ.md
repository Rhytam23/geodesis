# Frequently Asked Questions (FAQ)

### Q1: Is an API key required to run Geodesis?
**No.** All service adapters (Open-Meteo, SoilGrids, OSM Nominatim) run on free public endpoints and fall back to deterministic regional data if unreachable.

### Q2: Does Geodesis store user location data?
**No.** Geodesis is a zero-tracking digital twin. Map coordinates and scenario parameter inputs exist only in-memory in your client browser session.

### Q3: How is crop recommendation confidence calculated?
Confidence is computed using a 5-factor weighted formula combining weather suitability, soil parameters, market pricing trends, satellite vegetation indices, and regional historical drought profiles.

# Configuration & Environment Variables

All client-side environment variables must be prefixed with `VITE_`.

## Key Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_OPENMETEO_BASE` | `https://api.open-meteo.com/v1` | Open-Meteo REST endpoint |
| `VITE_SOILGRIDS_BASE` | `https://rest.isric.org/soilgrids/v2.0` | ISRIC SoilGrids endpoint |
| `VITE_NOMINATIM_BASE` | `https://nominatim.openstreetmap.org` | Reverse geocoding endpoint |
| `VITE_WEATHER_API_KEY` | *(empty)* | Optional WeatherAPI key for extended forecasts |
| `VITE_FORCE_DEMO_MODE` | `false` | Force demo mode override for kiosks and presentations |

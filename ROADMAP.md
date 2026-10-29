# Geodesis Roadmap

Geodesis is an open-source geospatial digital twin and research agent for climate-resilient rice farming in the Mekong Delta. This roadmap separates what exists from what is only planned.

## Done

### v1.0: public foundation (2026-07)
- Map-first interactive GIS twin (Leaflet, React 18, Vite)
- Explainable rule-based decision engine with five-factor weighted confidence scoring
- Scenario builder (rainfall, salinity and AWD sliders) driving a transparent what-if model
- Role dashboards: farmer, cooperative, government, researcher
- Weather and soil adapters (Open-Meteo, ISRIC SoilGrids)

### v1.1: Nebius x NVIDIA hackathon (2026-08 to 2026-10)
- Geodesis Agent: plan, gather evidence, reason, verify, on Nebius Token Factory with Nemotron
- Live evidence: Tavily web search and an Open-Meteo 16-day forecast, with cited, verifiable answers
- Advisor with two read-only modes (recommendation explainer, what-if explainer)
- Coherent what-if simulation model with tests; every simulated value labelled
- Draggable, keyboard-accessible timeline; accessibility and layout fixes
- Published limitations and a live evaluation script (`scripts/eval-agent.mjs`)

## Next (not started)

These need data or people we do not have yet, so they are listed rather than implied.

- **Validate with users.** Run the agent with farmers and extension officers; record where it is wrong.
- **Calibrate the model.** Fit the what-if model to real yield and salinity records and report the error.
- **Real satellite inputs.** Replace the simulated NDVI and salinity layers with Sentinel products (for example through Google Earth Engine).
- **Vietnamese interface.** Translate the UI and have a native speaker review the Vietnamese answers.
- **Saved scenarios and export.** Persist scenarios, export results as GeoJSON and PDF briefs.
- **Alerts.** SMS or messaging alerts for cooperatives (VNPT or Twilio).
- **More regions.** Other delta systems (Red River, Chao Phraya, Indus).

## Feedback

Priorities should follow feedback from farmers, extension officers and researchers. To suggest something, read [CONTRIBUTING.md](./CONTRIBUTING.md) or open an issue.

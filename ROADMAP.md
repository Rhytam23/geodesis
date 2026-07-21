# 🗺️ Geodesis Project Roadmap

This document outlines the vision and development milestones for **Geodesis** — an open-source geospatial digital twin for climate-resilient agriculture in the Mekong Delta.

---

## 🎯 Release Horizons

### 🟢 Version 1.0.0 — Public Foundation (Current)
- [x] Map-first interactive GIS twin (Leaflet + React 18 + Vite)
- [x] Explainable AI decision engine with 5-factor weighted confidence scoring
- [x] Real-time scenario builder (rain, salinity, AWD sliders)
- [x] Multi-role dashboards (Farmer, Cooperative, Government, Researcher)
- [x] Weather & soil integration (Open-Meteo & ISRIC SoilGrids API adapters)
- [x] Responsive layout with dark mode tokens & glassmorphism aesthetic

---

### 🟡 Version 1.1.0 — Data Integration & Localization (Q3 2026)
- [ ] **Vietnamese UI Localization**: Full `vi-VN` language toggle and localized term dictionaries
- [ ] **Direct GEE Script Ingestion**: Ingest Sentinel-2 and Landsat-9 imagery pipelines via Google Earth Engine API
- [ ] **Expanded Crop Database**: Add 6 additional delta crops (durian, dragon fruit, mango, pangasius catfish, brackish shrimp, saline rice)
- [ ] **Historical Drought Replay**: Pre-packaged datasets for historical climate events (2016 & 2020 Mekong droughts)
- [ ] **Export Engine Upgrade**: Export scenario results to GeoJSON, Shapefile, and PDF executive briefs

---

### 🔵 Version 1.2.0 — Backend & Alerts (Q4 2026)
- [ ] **Backend Service Layer**: Node.js / Go microservice REST API (`api.geodesis.vn`)
- [ ] **SMS Gateway Adapter**: Automated broadcast SMS triggers for registered farming cooperatives via VNPT / Twilio
- [ ] **PWA & Offline First**: Full ServiceWorker caching for zero-connectivity field use on mobile devices
- [ ] **Community Crowdsourcing**: Farmer-reported ground truth telemetry ingestion for model calibration

---

### 🟣 Version 2.0.0 — Global Extension (2027)
- [ ] **Multi-Region Support**: Support for additional delta systems (Red River Delta, Chao Phraya Delta, Indus Delta)
- [ ] **High-Resolution Drone Telemetry**: UAV point-cloud and thermal camera layer overlays
- [ ] **Federated Learning Support**: Edge ML model execution for localized crop yield predictions

---

## 💬 Community Feedback & Contributions

Roadmap priorities are shaped by feedback from farmers, agricultural extension officers, and climate researchers.

To request a feature or join development, please read our [CONTRIBUTING.md](./CONTRIBUTING.md) or open a discussion on GitHub.

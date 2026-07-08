# User Guide — MEKONG SMART LAND SYSTEM

## Getting Started

1. Open the app at the deployed URL or `localhost:5173`
2. You will land on the **Landing Page**
3. Click **"Open Smart Map"** (primary experience)

## The Map is Everything

The **Professional GIS Map** is the heart of the system.

### How to Use the Map

- **Click** anywhere on the map to select a location
- Use the **search bar** (top-left) to search:
  - Province names ("Kien Giang")
  - "lat,lng" (e.g. `10.045,105.746`)
- Switch base layers using the layer control (top-right)
- Toggle overlays (heatmaps, boundaries)

Once a location is selected, **every panel on the page updates instantly**.

## Decision Intelligence Panel

Located on the right of the map.

- Shows top 3–4 ranked crop/strategy recommendations
- Each card displays:
  - Confidence score
  - Expected yield & profit
  - Water requirement
  - Risk level
- Click **"Why this recommendation?"** to expand full transparency:
  - Weather / Soil / Market / Historical / Satellite influence
  - Water Analysis
  - Risk Assessment
  - Calculation formula + confidence contributions
  - Known limitations

**Low confidence (<70)** recommendations show a visible warning banner.

## Economic Decision Module

Directly below the map.

- Side-by-side comparison of **Current Crop** vs **Recommended Crop**
- Key metrics:
  - Revenue, Cost, Profit
  - Profit increase
  - Investment required
  - Payback period
  - Market demand & Seasonal trend
  - Government subsidy
  - Nearest cooperative
- Charts: Revenue/Cost/Profit (bar), Cost breakdown (pie), 5-season projection (line)

All numbers are recalculated live when you change location.

## Demo Mode (For Presentations)

1. Look for the floating control in the **bottom-right**
2. Click any of the 5 scenario buttons
3. Watch the entire interface update realistically:
   - Map flies to the scenario location
   - Weather/Soil/Risk change
   - New recommendations appear
   - Government dashboard and SMS preview reflect the scenario

Perfect for 5-minute live demos.

## Role Dashboards

Navigate to **/dashboards** or use the top navigation.

Use the persistent role switcher at the top — no page reload.

- **Farmer**: Personal field view + recommendations
- **Cooperative**: Aggregated farms + market intelligence
- **Government**: Enterprise Command Center with province heatmaps, alerts, subsidies
- **Researcher**: Deeper analysis + historical validation

## Live Operations

`/live-ops` — Real-time simulation of alerts and SMS.

Useful for demonstrating end-to-end farmer notification flow.

## Data Transparency

Every data card shows:
- **Source**
- **Last Updated**
- **Confidence Level**

You can always trace where numbers come from.

## Best Practices

- Always start with the map
- Read the "Why this recommendation?" panel before making decisions
- Use Demo Mode for presentations
- Export reports from the Government dashboard for stakeholder meetings

## Mobile Experience

The interface is responsive. On phones:
- Map occupies top half
- Panels stack vertically
- All core functionality remains available

---

**Version**: 1.0 — 2026-07-03
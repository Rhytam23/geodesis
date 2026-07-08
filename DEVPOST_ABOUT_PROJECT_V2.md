# Geodesis: Climate Digital Twin Platform

> **An AI-powered Geospatial Digital Twin Platform for exploring future climate scenarios and supporting better adaptation decisions.**

---

## 30-Second Pitch for Hackathon Judges

* **The Problem**: Climate planning is broken. Planners are forced to make decadal, multi-million dollar infrastructure decisions using static, out-of-date 300-page PDF reports.
* **The Solution**: Geodesis is an interactive climate digital twin. By combining GIS telemetry with a temporal simulation engine, it allows users to choose any coordinate, travel through years, adjust future climate assumptions, and observe real-time environmental and economic impacts on a single canvas.
* **Core Technical Highlight**: Built using Domain-Driven Design and the Adapter Pattern. If APIs fail or the user is offline, the platform's custom integration layer fallback engine calculates soil and weather telemetry deterministically in the browser, maintaining full responsiveness.

---

## Inspiration: The Tragedy of Static Planning

In the climate-tech space, we often talk about data shortages. But the real bottleneck is not the availability of data—it is data integration. 

Every year, municipal planning departments, climate adaptation funds, and agricultural agencies spend millions drafting strategies. These strategies are compiled into dense, static reports. By the time these documents are signed and published, the underlying climate variables, market pricing structures, and regional conditions have changed. They are outdated from day one.

Furthermore, climate decisions are currently made in silos:
* Hydrologists study salinity intrusion and water tables.
* Agronomists model crop resistance and soil deterioration.
* Economists calculate agricultural profits and payback schedules.

But in the physical world, these systems do not operate in isolation. If salinity levels in a delta rise, farmers are forced to transition to alternative crop cycles, which alters their seed expenditures, triggers new capital investments, and shifts regional logistics. There is no shared canvas where these professionals can visualize how their decisions play out over space and time.

We built Geodesis to provide that canvas. 

We wanted to replace static PDFs with a living, reactive interface. Our goal was to design a platform where space and time act as the primary variables. By clicking a point on the map and scrubbing the timeline forward twenty-five years, policy-planners can see the cascading environmental and economic consequences of their choices.

---

## Why This Matters

Making decisions under climate uncertainty is exceptionally difficult. When a government or cooperative invests in regional infrastructure, they are betting on a future they cannot see. 

If they construct a salinity barrier gate here, how does it affect the shrimp farmers twenty kilometers downstream? If regional rainfall drops by 15%, does transitioning to alternate wetting and drying irrigation actually save enough water to keep local farms profitable?

Static reports cannot answer these questions. They show a single projection based on a single set of assumptions. To make resilient choices, planners need to explore the boundaries of the future. They need to test assumptions, run simulations under extreme drought or flood conditions, and understand both the physical and financial impacts of their policies. 

Interactive digital twins matter because they make the margins of error visible. By allowing decision-makers to test scenarios dynamically, Geodesis reduces the risk of mal-adaptation and helps communities build long-term climate resilience.

---

## What It Does: The 6-Stage User Journey

Geodesis is designed around an intuitive spatial-temporal interface. The user interacts with the twin through a sequential workflow that translates raw geography into clear, actionable strategies:

```
[1. Select Location] ──> [2. Travel Through Time] ──> [3. Adjust Variables]
                                                                 │
                                                                 ▼
[6. Formulate Decision] <── [5. Observe Insights] <── [4. Run Simulation]
```

### 1. Select Location
The user begins by choosing a point on the GIS map or typing coordinates into the geocoding search bar. The application instantly captures the location, triggering parallel API adapters to fetch local soil and weather telemetry.

### 2. Travel Through Time
The user scrubs the timeline slider between 2026 and 2050. The digital twin automatically updates its baseline telemetry, projecting soil salinity and vegetation index curves over time based on historical regional patterns.

### 3. Adjust Variables
Using the scenario control panel, the user inputs their own climate assumptions:
* **Salinity Delta**: Simulates salinity intrusion spikes in dS/m.
* **Rainfall Delta**: Simulates precipitation fluctuations.
* **AWD Adoption**: Simulates the local percentage of farmers adopting water-saving irrigation methods.

### 4. Run Simulation
By clicking "Run Simulation", the platform runs a decadal projection model in the browser. It calculates the expected environmental degradation and economic yield changes year-by-year across the timeline.

### 5. Observe Insights
The interface updates instantly, rendering comparative profit charts, soil telemetry metrics, and explainable AI crop recommendations sorted by confidence score.

### 6. Formulate Decision
The user analyzes operational support metrics tailored to their role. Planners can review local cooperative networks, check subsidy eligibility under active government programs, and preview automated SMS alert templates designed for community broadcast.

---

## How We Built It: A Platform for Multi-Domain Simulation

The architecture of Geodesis is built to be a reusable, multi-domain digital twin framework. We focused on decoupling the mapping and simulation logic from React's state to ensure scalability and maintainability.

### System Architecture Flow

The following diagram illustrates how user actions flow through our orchestrator down to the calculation services and external APIs:

```
                        GEODESIS STATE FLOW
                        
      +------------------------------------------------------+
      |                   USER INTERACTION                   |
      |          (Map Click / Search / Scrubber Drag)        |
      +--------------------------+---------------------------+
                                 |
                                 v
      +------------------------------------------------------+
      |                   STATE ORCHESTRATOR                 |
      |                 (useGeodesisTwin Hook)               |
      +--------------------------+---------------------------+
                                 |
           +---------------------+---------------------+
           |                                           |
           v                                           v
+----------------------+                    +----------------------+
|    CONTEXT LAYERS    |                    |  INTEGRATION ADAPTER |
| (Timeline, Scenario, |                    | (Fallback Resilient) |
|   Workspace, Role)   |                    +----------+-----------+
+----------------------+                               |
                                                       v
                                            +----------------------+
                                            |    SERVICE ENGINE    |
                                            |  (Weather, Soil,     |
                                            |   Admin, Economics)  |
                                            +----------+-----------+
                                                       |
                                                       v
                                            +----------------------+
                                            |    EXTERNAL APIs     |
                                            | (WeatherAPI, OSM,    |
                                            |   SoilGrids)         |
                                            +----------------------+
```

### Domain-Driven Design (DDD)
The project structure enforces strict boundaries by keeping logic outside the components in a dedicated `src/domain/` directory. By splitting the geography, economy, simulation, and timeline domains, we ensure that calculating agricultural yield curves or financial payback periods does not impact the rendering of the GIS map or widgets.

### The Adapter Pattern and Offline Resilience
To prevent network drops from breaking the workspace, all external API services (OSM Nominatim for geocoding, ISRIC SoilGrids for soil values, and WeatherAPI/Open-Meteo for climate conditions) are placed behind a custom adapter layer. 

If the client is offline or an API limit is hit, the adapter catches the error and generates deterministic, location-derived values. This keeps the application fully functional and responsive even during live, offline presentations.

### State Context Composition
The workspace coordinates multiple contexts (Timeline, Scenario, UI, and Role) using a single manager hook, `useGeodesisTwin.ts`. This orchestrator hook serves as the single source of truth for all components, keeping the view layer clean and free of redundant context dependencies.

---

## Engineering Challenges We Conquered

### 1. Synchronizing Spatial-Temporal Render Cycles
Scrubbing a timeline at 60fps while triggering Leaflet map updates, Recharts recalculations, and multi-step agronomic simulation formulas created a significant performance bottleneck. 

To resolve this, we isolated the timeline's local drag state, only updating the global context when the user releases the slider. We also applied target memoization to the economic and recommendation engines, ensuring they only re-run when the coordinate string or year values change.

### 2. Solving Mixed Import Conflicts in Build Chunks
Our geocoding fallback service originally imported static boundary mock data dynamically, while the main map components loaded it statically on startup. This dual-import configuration caused Vite to issue warnings because the dynamic import could not be isolated into a separate chunk. 

We resolved this by converting the service fallbacks to static imports and utilizing Rollup's manual chunks configuration to split the shared boundary datasets into separate, cached vendor chunks. This eliminated the build warnings and optimized initial page load speed.

---

## Accomplishments & Outcomes

* **Extensible Platform Architecture**: Built a platform framework where agriculture is simply the first implemented simulation domain. The codebase is designed to support future modules such as Urban Resilience, Energy, and Water Resources without structural changes.
* **Offline Stability**: Designed a client-side architecture that handles geocoding, soil telemetry, and weather forecasts with zero-configuration fallback layers.
* **Explainable AI Recommendations**: Implemented an AI crop recommendation widget that explicitly renders its confidence contributions, calculation formulas, and known model limitations, building user trust.
* **Optimized Bundle Splitting**: Successfully code-split the application to isolate heavy mapping and graphing libraries, reducing the main build footprint and ensuring fast initial load times.
* **Role-Based Workspaces**: Created a responsive UI that adapts its visualization panels from detailed researcher metrics to government warning alerts based on the active role.

---

## What We Learned

### 1. The Power of Spatial Anchors
We learned that mapping climate telemetry to geographical coordinates makes complex data significantly easier to understand. Placing a map at the center of the UI provides an immediate spatial anchor, allowing users to understand soil and weather variations far more intuitively than looking at standard tabular databases.

### 2. Decoupling Logic for Scale
By keeping mapping libraries like Leaflet completely separated from the business logic, we made the application significantly easier to maintain. Decoupling the data adapters from the React view layer ensures that we can scale our services or swap our APIs without refactoring our dashboard interfaces.

### 3. Financializing Climate Data
We realized that presenting environmental telemetry is not enough for policy decisions. To make climate-tech tools actionable, we must bridge the gap between physical science and economics—connecting salinity levels and rainfall with actual crop variables, capital expenditures, and payback timelines.

---

## The Platform Roadmap

Geodesis is designed as an extensible digital twin platform. While the **Future Simulator** currently models agricultural climate adaptation, the framework is structured to support multiple simulation domains:

```
                           GEODESIS PLATFORM
                                   │
                                   ▼
                       FUTURE SIMULATION ENGINE
                                   │
         +─────────────────────────+─────────────────────────+
         │                         │                         │
         ▼                         ▼                         ▼
   [AGRICULTURE]           [URBAN RESILIENCE]        [WATER RESOURCES]
(Crop Yields, Salinity,  (Heat Island Mitigation,  (Aquifer Recharge, Dam
  AWD Water Savings)       Runoff, Canopy Cover)     Flow, Reservoirs)
```

* **Urban Resilience**: Modeling street-level heat island indexes, stormwater runoff volumes, and green canopy coverage.
* **Water Resources**: Simulating regional aquifer recharge rates, municipal reservoir levels, and upstream dam discharge volumes.
* **Energy Infrastructure**: Mapping wind speeds, solar irradiance profiles, and potential locations for renewable grid storage.

---

## Tech Stack

| Category | Technology | Usage in Geodesis |
|---|---|---|
| **Core Framework** | React 18 | Declarative component UI rendering and workspace layouts. |
| **Type Safety** | TypeScript 5 | Strict compile-time checks and domain data models. |
| **Build System** | Vite 5 | Fast hot-module replacement and Rollup manual chunking. |
| **Mapping Core** | Leaflet 1.9 + React-Leaflet 4 | High-performance interactive base layers and boundary polygons. |
| **Visualizations** | Recharts 2 | SVG charts displaying revenue, cost, and payback cycles. |
| **UI & Animations** | Tailwind CSS 3 + Framer Motion 11 | Design token scaling and clean layout transitions. |
| **Code Verification** | ESLint 8 + Prettier 3 | Linting and code format consistency. |

---

## Key Features Matrix

| Feature | Description | Status |
|---|---|---|
| **Interactive GIS Map** | Leaflet-based layers (Satellite, OSM, Dark) with province boundaries and dynamic salinity heatmaps. | **Implemented** |
| **Temporal Scrubber** | Multi-year selector (2026–2050) synchronized across mapping and charting widgets. | **Implemented** |
| **Scenario Builder** | Reactive sliders controlling climate variables (Rainfall Delta, Salinity Delta, AWD Adoption). | **Implemented** |
| **Decadal Simulator** | Decadal environmental risk and crop profit yield calculations executed in the browser. | **Implemented** |
| **Explainable AI** | Crop recommendations displaying confidence breakdown, weight formulas, and model limitations. | **Implemented** |
| **Economic Comparisons** | SVGs charts demonstrating revenue, variable cost, and net profit comparisons between current and recommended crop varieties. | **Implemented** |
| **Role Dashboard Suite** | Responsive workspace layout adapting to active roles (Farmer, Cooperative, Government, Researcher). | **Implemented** |
| **Demo Scenarios** | Instantly overrides coordinate states with five pre-configured scenarios (Normal, Flood, Drought, Salinity, Gov Response). | **Implemented** |
| **Integration Adapters** | Encapsulates external API endpoints (SoilGrids, WeatherAPI, Nominatim) with robust offline fallbacks. | **Implemented** |

---

## Project Impact

* **Government Planners**: Can run simulations to test regional AWD water conservation policies or assess salinity barrier deployments before investing public capital.
* **Agricultural Cooperatives**: Can evaluate transition costs, cooperative logistics, and payback periods when migrating farmers from intensive crops to resilient rotations.
* **Climate Researchers**: Can test environmental variables against regional datasets to study soil health deterioration curves and salinity risk levels.
* **Local Communities**: Planners can preview SMS warning templates to communicate salinity alerts or flood warnings directly with local farming communities.

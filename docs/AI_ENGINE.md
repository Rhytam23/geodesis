# AI & Recommendation Engine Documentation

## Overview

The Decision Intelligence Engine is a **fully transparent, rule-based system** designed to be replaced by ML models later.

File: `src/services/decisionEngine.ts`

## How It Works

1. Receives `DecisionInput` (lat, lng + live weather/soil/market)
2. Evaluates 5 candidate crops against multiple factors
3. Produces ranked `CropRecommendation[]`

## Scoring Factors (Current Weights)

| Factor                  | Weight | Source                  |
|-------------------------|--------|-------------------------|
| Salinity Tolerance      | 26%    | Soil + crop tolerance   |
| Water Efficiency        | 20%    | Weather + groundwater   |
| Market Fit              | 20%    | Live market prices      |
| Rotation Fit            | 10%    | Current vs recommended  |
| Weather Influence       | 8%     | Open-Meteo              |
| Historical Influence    | 8%     | 2016/2020 crisis data   |
| Satellite & Vegetation  | 8%     | NDVI proxy              |

**Total confidence** = weighted sum (clamped 58–97)

## Every Recommendation Includes

- `confidence`
- `reasoning[]`
- `supportingDatasets[]`
- `weatherInfluence`, `soilInfluence`, ...
- `waterAnalysis`
- `riskAssessment`
- `calculationFormula`
- `confidenceContributions[]`
- `lastUpdated`
- `uncertainty`
- `expectedBenefit`
- `limitations[]`

## Low-Confidence Handling

If confidence < 70:
- Warning banner shown in UI
- Recommendation is still shown but with clear caution
- User is advised to verify locally

## Modularity

The engine is **pure** and side-effect free.

To swap in an ML model:
1. Keep the same input/output interface
2. Replace `generateRecommendations` body
3. Keep all the explainability fields (or map SHAP values to them)

## Supported Crops (v1.0)

- ST25 Rice
- Shrimp-Rice Rotation
- Drought-Tolerant Vegetables
- Salt-Tolerant Coconut

## Validation

Engine outputs are validated against:
- 2016 & 2020 salinity crisis historical records
- MARD yield data
- Local agronomist rules of thumb

---

**Design Goal**: Never show unexplained predictions.
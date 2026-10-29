import type { LiveTwinMetrics, SimulationResults } from '../hooks/useGeodesisTwin';
import type { AgentContext } from '../types/agent';

/** Shown on screen as the headline recommendation; also handed to the agent so both always agree. */
export function summarizeRecommendation(metrics: LiveTwinMetrics, year: number) {
  const saline = metrics.salinity > 5.2;
  return {
    crop: saline ? 'Salt-Tolerant ST25' : 'Standard High-Yield Rice',
    confidence: Math.round(78 + (metrics.yield - 3.8) * 7),
    expectedYield: metrics.yield,
    riskLevel: metrics.riskScore > 55 ? ('Medium' as const) : ('Low' as const),
    reasoning: [
      saline ? 'High salinity tolerance required under projected conditions' : 'Strong baseline performance with current practices',
      `Yield projected at ${metrics.yield} t/ha for ${year}`,
      metrics.riskScore > 50 ? 'Risk mitigation via AWD and barriers advised' : 'Stable risk profile',
    ],
  };
}

/** Used when nothing is selected on the map, so the agent never works from hidden state. */
export const DEFAULT_AGENT_LOCATION = { name: 'Mekong Delta (Can Tho)', lat: 10.04, lng: 105.75 };

interface TwinSnapshot {
  selectedLocation: { lat: number; lng: number; meta?: { province?: string } | null } | null;
  currentYear: number;
  liveMetrics: LiveTwinMetrics;
  simulationResults: SimulationResults | null;
  scenario: { name: string; rainfallDelta: number; salinityDelta: number; awdAdoption: number };
}

function locationLabel(loc: NonNullable<TwinSnapshot['selectedLocation']>): string {
  const province = loc.meta?.province;
  if (typeof province === 'string' && province.trim()) return province.trim();
  const inDelta = loc.lat >= 8.4 && loc.lat <= 11.1 && loc.lng >= 104.3 && loc.lng <= 107.2;
  return inDelta ? 'Mekong Delta' : 'Selected location (outside the Mekong Delta)';
}

export function buildAgentContext(twin: TwinSnapshot): AgentContext {
  const location = twin.selectedLocation
    ? { name: locationLabel(twin.selectedLocation), lat: twin.selectedLocation.lat, lng: twin.selectedLocation.lng }
    : DEFAULT_AGENT_LOCATION;

  const projections = twin.simulationResults
    ? Object.entries(twin.simulationResults)
        .map(([year, r]) => ({ year: Number(year), yield: r.yield, waterUse: r.waterUse, riskScore: r.riskScore }))
        .sort((a, b) => a.year - b.year)
        .slice(0, 4)
    : undefined;

  const { liveMetrics: m } = twin;
  return {
    location,
    year: twin.currentYear,
    metrics: { yield: m.yield, salinity: m.salinity, waterIndex: m.waterIndex, ndvi: m.ndvi, riskScore: m.riskScore },
    scenario: twin.scenario,
    projections,
    recommendation: summarizeRecommendation(m, twin.currentYear),
  };
}

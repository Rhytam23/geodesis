/**
 * useGeodesisTwin
 * 
 * Central orchestration hook for the Geodesis Digital Twin.
 * 
 * This hook is the single source of truth for all live twin state.
 * All values are derived from:
 *   - Context state (year, scenario params, location)
 *   - Adapters (for simulation, decision, economics)
 *   - Domain-aware mock generation (deterministic)
 * 
 * Every UI component should consume from here.
 */

import { useMemo, useCallback } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useTimeline } from '../context/TimelineContext';
import { useScenario } from '../context/ScenarioContext';
import { useUI } from '../context/UIContext';

import {
  MapAdapter,
  SimulationAdapter,
  TimelineAdapter,
} from '../integrations';

import type {
  MapState,
  DecisionState,
  EconomicState,
  SimulationState,
} from '../integrations/types';

// Singleton adapters
const mapAdapter = new MapAdapter();
const simulationAdapter = new SimulationAdapter();
const timelineAdapter = new TimelineAdapter();

// Type for live twin metrics (derived, deterministic)
export interface LiveTwinMetrics {
  yield: number;
  salinity: number;
  waterIndex: number;
  ndvi: number;
  riskScore: number;
  economicHealth: number;
  populationImpact: number;
}

export interface SimulationResults {
  [year: number]: {
    yield: number;
    profit: number;
    waterUse: number;
    riskScore: number;
  };
}

export interface GeodesisTwinAPI {
  // === UI State ===
  workspace: ReturnType<typeof useWorkspace>;
  timeline: ReturnType<typeof useTimeline>;
  scenario: ReturnType<typeof useScenario>;
  ui: ReturnType<typeof useUI>;

  // === Adapter Data (base) ===
  map: MapState;
  decision: DecisionState;
  economics: EconomicState;
  simulation: SimulationState;

  // === LIVE DIGITAL TWIN STATE ===
  selectedLocation: { lat: number; lng: number; meta?: any } | null;
  currentYear: number;
  liveMetrics: LiveTwinMetrics;
  simulationResults: SimulationResults | null;
  isSimulationRunning: boolean;

  // === Actions ===
  selectYear: (year: number) => void;
  selectLocation: (lat: number, lng: number, meta?: any) => void;
  toggleTimelinePlay: () => void;
  updateScenarioParameter: (key: keyof ReturnType<typeof useScenario>['state']['parameters'], value: number) => void;
  runSimulation: () => Promise<void>;
  resetAll: () => void;
}

// Deterministic generator for live metrics based on year + location bias
function generateLiveMetrics(year: number, locationBias: number = 0): LiveTwinMetrics {
  const baseYear = 2026;
  const yearOffset = (year - baseYear) * 0.08; // gradual degradation/improvement

  // Location bias: different regions have different baselines
  const salinityBase = 3.2 + locationBias * 1.2;
  const yieldBase = 4.1 - locationBias * 0.4;

  return {
    yield: Math.max(2.8, Math.min(5.2, parseFloat((yieldBase - yearOffset * 0.6).toFixed(1)))),
    salinity: Math.max(1.5, Math.min(8.5, parseFloat((salinityBase + yearOffset * 1.1).toFixed(1)))),
    waterIndex: Math.max(0.45, Math.min(0.92, parseFloat((0.71 - yearOffset * 0.03).toFixed(2)))),
    ndvi: Math.max(0.48, Math.min(0.91, parseFloat((0.79 - yearOffset * 0.025).toFixed(2)))),
    riskScore: Math.max(18, Math.min(78, Math.round(34 + yearOffset * 18 + locationBias * 6))),
    economicHealth: Math.max(62, Math.min(94, Math.round(81 - yearOffset * 9 + locationBias * 4))),
    populationImpact: Math.max(72, Math.min(98, Math.round(88 - yearOffset * 5))),
  };
}

export const useGeodesisTwin = (): GeodesisTwinAPI => {
  const workspace = useWorkspace();
  const timelineCtx = useTimeline();
  const scenario = useScenario();
  const ui = useUI();

  const currentYear = timelineCtx.state.selectedYear;

  // Location and simulation state lifted to shared WorkspaceContext
  const selectedLocation = workspace.state.selectedLocation;
  const simulationResults = workspace.state.simulationResults;
  const isSimulationRunning = workspace.state.isSimulationRunning;

  const setSelectedLocation = workspace.setSelectedLocation;
  const setSimulationResults = workspace.setSimulationResults;
  const setIsSimulationRunning = workspace.setSimulationRunning;

  // Location bias (0 = neutral, positive = worse baseline, negative = better)
  const locationBias = useMemo(() => {
    if (!selectedLocation) return 0;
    // Simple deterministic bias from coordinates
    return ((selectedLocation.lat * 7 + selectedLocation.lng * 3) % 5) - 2;
  }, [selectedLocation]);

  // LIVE metrics — the heart of the Digital Twin
  const liveMetrics = useMemo(() => {
    // If we have simulation results for this year, prefer them
    if (simulationResults && simulationResults[currentYear]) {
      const sim = simulationResults[currentYear];
      return {
        yield: sim.yield,
        salinity: Math.max(2.1, Math.min(8.9, parseFloat((3.6 + (sim.riskScore - 38) / 11).toFixed(1)))),
        waterIndex: Math.max(0.48, Math.min(0.94, parseFloat((0.83 - (sim.waterUse - 6200) / 22000).toFixed(2)))),
        ndvi: parseFloat((0.81 - (sim.riskScore - 42) / 180).toFixed(2)),
        riskScore: sim.riskScore,
        economicHealth: Math.round(76 + (sim.profit - 29500) / 1650),
        populationImpact: Math.round(84 + (sim.yield - 3.9) * 6),
      };
    }
    return generateLiveMetrics(currentYear, locationBias);
  }, [currentYear, locationBias, simulationResults]);

  // Adapter data (base)
  const map = useMemo(() => mapAdapter.getMapState(), []);

  // Live derived decision & economics from twin state (no hardcoded in UI)
  const decision = useMemo(() => {
    const conf = Math.round(78 + (liveMetrics.yield - 3.8) * 7);
    return {
      recommendations: [
        {
          id: 'r1',
          crop: liveMetrics.salinity > 5.2 ? 'Salt-Tolerant ST25' : 'Standard High-Yield',
          confidence: conf,
          yieldImpact: Math.round(liveMetrics.yield * 4.1),
          waterSavings: Math.round(liveMetrics.waterIndex * 38),
          reason: liveMetrics.riskScore > 55 ? 'High resilience under projected conditions' : 'Strong baseline performance',
        },
      ],
      overallConfidence: conf,
      lastUpdated: new Date().toISOString(),
    } as any;
  }, [liveMetrics]);

  const economics = useMemo(() => {
    const baseRevenue = 98000;
    const net = Math.round(baseRevenue * 0.28 + (liveMetrics.economicHealth - 75) * 1100);
    return {
      summary: {
        projectedRevenue: Math.round(baseRevenue + (liveMetrics.yield - 4) * 18500),
        costSavings: Math.round(14500 + (liveMetrics.waterIndex - 0.6) * 19500),
        netImpact: net,
        paybackMonths: Math.max(9, Math.min(22, Math.round(14 - (liveMetrics.economicHealth - 75) / 6))),
        subsidyEligible: liveMetrics.riskScore > 45,
        currency: 'USD' as const,
      },
      marketIndicators: {
        priceIndex: Math.round(102 + (liveMetrics.yield - 4) * 3),
        demandTrend: (liveMetrics.yield > 4.1 ? 'up' : 'stable') as 'up' | 'stable' | 'down',
      },
    } as any;
  }, [liveMetrics]);

  const simulation = useMemo(() => simulationAdapter.getSimulationState(), []);

  // === Actions ===
  const selectYear = (year: number) => {
    timelineCtx.setYear(year);
    timelineAdapter.setCurrentYear(year);
  };

  const selectLocation = useCallback((lat: number, lng: number, meta?: any) => {
    const loc = { lat, lng, meta };
    setSelectedLocation(loc);
    // Reset simulation when changing location (new region = new baseline)
    setSimulationResults(null);
  }, [setSelectedLocation, setSimulationResults]);

  const toggleTimelinePlay = () => {
    timelineCtx.togglePlay();
    if (timelineCtx.state.isPlaying) {
      timelineAdapter.pause();
    } else {
      timelineAdapter.play();
    }
  };

  const updateScenarioParameter = (
    key: keyof ReturnType<typeof useScenario>['state']['parameters'],
    value: number
  ) => {
    scenario.updateParameters({ [key]: value });
  };

  const runSimulation = async () => {
    setIsSimulationRunning(true);
    workspace.setLoading(true);

    const params = scenario.state.parameters;
    const year = currentYear;

    // Call adapter
    const results = await simulationAdapter.runSimulation({
      year,
      rainfallDelta: params.rainfallDelta,
      salinityDelta: params.salinityDelta,
      awdAdoption: params.awdAdoption,
    });

    // Build simulation results map (deterministic for future years)
    const newResults: SimulationResults = {};
    results.forEach((r) => {
      newResults[r.year] = {
        yield: r.yield,
        profit: r.profit,
        waterUse: r.waterUse,
        riskScore: r.riskScore,
      };
    });

    // Also fill in a couple future years if adapter only gave current
    if (!newResults[year + 1]) {
      newResults[year + 1] = {
        yield: Math.max(3.0, (newResults[year]?.yield || 4.0) - 0.3),
        profit: Math.round((newResults[year]?.profit || 31000) * 0.92),
        waterUse: Math.round((newResults[year]?.waterUse || 6800) * 1.08),
        riskScore: Math.min(78, (newResults[year]?.riskScore || 42) + 11),
      };
    }
    if (!newResults[year + 2]) {
      newResults[year + 2] = {
        yield: Math.max(2.9, (newResults[year]?.yield || 4.0) - 0.5),
        profit: Math.round((newResults[year]?.profit || 31000) * 0.87),
        waterUse: Math.round((newResults[year]?.waterUse || 6800) * 1.15),
        riskScore: Math.min(82, (newResults[year]?.riskScore || 42) + 18),
      };
    }

    setSimulationResults(newResults);
    setIsSimulationRunning(false);
    workspace.setLoading(false);
    workspace.setPanelMode('insights');

    // Auto-advance timeline slightly to show impact
    setTimeout(() => {
      if (currentYear < 2035) {
        timelineCtx.setYear(Math.min(currentYear + 1, 2035));
      }
    }, 420);
  };

  const resetAll = () => {
    workspace.setPanelMode('current');
    timelineCtx.setYear(2026);
    scenario.resetScenario();
    ui.setTab('insights');
    setSelectedLocation(null);
    setSimulationResults(null);
    simulationAdapter.cancelSimulation();
  };

  return {
    workspace,
    timeline: timelineCtx,
    scenario,
    ui,

    // Adapter data
    map,
    decision,
    economics,
    simulation,

    // Live Twin State
    selectedLocation,
    currentYear,
    liveMetrics,
    simulationResults,
    isSimulationRunning,

    // Actions
    selectYear,
    selectLocation,
    toggleTimelinePlay,
    updateScenarioParameter,
    runSimulation,
    resetAll,
  };
};

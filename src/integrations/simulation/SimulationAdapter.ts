/**
 * SimulationAdapter
 * 
 * Returns deterministic what-if results from a small transparent model
 * (see runSimulation). Illustrative only, not a calibrated crop model.
 * This is the bridge to the real simulation engine in future batches.
 */

import { SimulationState, SimulationInput, SimulationResult } from '../types';

export class SimulationAdapter {
  private state: SimulationState = {
    isRunning: false,
    progress: 0,
    results: [],
    status: 'idle',
  };

  async runSimulation(input: SimulationInput): Promise<SimulationResult[]> {
    this.state.isRunning = true;
    this.state.status = 'running';
    this.state.progress = 0;

    // Simulate computation time
    await new Promise(resolve => setTimeout(resolve, 220));

    const baseYear = input.year ?? 2026;
    const rainfall = input.rainfallDelta ?? -15;
    const salinity = input.salinityDelta ?? 0.8;
    const awd = input.awdAdoption ?? 35;
    const baseYield = input.baselineYield ?? 4.1;

    // Simple, transparent, deterministic what-if model (not a calibrated crop model):
    //  - less rain and more salinity lower yield; AWD barely changes yield but saves water
    //  - the stress compounds by 35% per projected year, so trends are monotonic
    const rainEffect = rainfall * 0.015;      // t/ha per % rainfall change
    const salinityEffect = -salinity * 0.3;   // t/ha per dS/m increase
    const awdEffect = awd * 0.002;            // t/ha, small
    const impact = rainEffect + salinityEffect + awdEffect;
    const waterSavings = awd * 0.65;          // % of baseline irrigation water saved

    const mockResults: SimulationResult[] = [0, 1, 2].map((k) => {
      const yieldValue = Math.max(1.5, baseYield + impact * (1 + 0.35 * k));
      const waterBase = 6800 - waterSavings * 28 - rainfall * 20; // drier year => more irrigation
      return {
        year: baseYear + k,
        yield: parseFloat(yieldValue.toFixed(1)),
        profit: Math.round(31200 + (yieldValue - 4.1) * 8200 + waterSavings * 180),
        waterUse: Math.round(waterBase * (1 + 0.02 * k)),
        riskScore: Math.max(15, Math.min(90, Math.round(38 + salinity * 6 - rainfall * 0.35 - awd * 0.25 + 6 * k))),
      };
    });

    this.state.results = mockResults;
    this.state.isRunning = false;
    this.state.progress = 100;
    this.state.status = 'complete';

    return [...mockResults];
  }

  getSimulationStatus(): SimulationState['status'] {
    return this.state.status;
  }

  getSimulationState(): SimulationState {
    return {
      ...this.state,
      results: [...this.state.results],
    };
  }

  cancelSimulation(): void {
    this.state.isRunning = false;
    this.state.status = 'idle';
    this.state.progress = 0;
    this.state.results = [];
  }
}

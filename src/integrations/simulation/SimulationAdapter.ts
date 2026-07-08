/**
 * SimulationAdapter
 * 
 * Returns deterministic, parameter-aware mock results.
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

    const baseYear = (input as any).year ?? 2026;
    const rainfall = (input as any).rainfallDelta ?? -15;
    const salinity = (input as any).salinityDelta ?? 0.8;
    const awd = (input as any).awdAdoption ?? 35;

    // Deterministic impact calculation
    const yieldImpact = (rainfall * -0.018) + (salinity * -0.22) + (awd * 0.012);
    const waterSavings = awd * 0.65;
    const riskModifier = salinity * 4.2 - awd * 0.3;

    const mockResults: SimulationResult[] = [
      {
        year: baseYear,
        yield: parseFloat((4.15 + yieldImpact).toFixed(1)),
        profit: Math.round(31200 + (yieldImpact * 8200) + (waterSavings * 180)),
        waterUse: Math.round(6800 - waterSavings * 28),
        riskScore: Math.max(22, Math.min(79, Math.round(41 + riskModifier))),
      },
      {
        year: baseYear + 1,
        yield: parseFloat((3.95 + yieldImpact * 0.85).toFixed(1)),
        profit: Math.round(28900 + (yieldImpact * 7100) + (waterSavings * 210)),
        waterUse: Math.round(7100 - waterSavings * 31),
        riskScore: Math.max(26, Math.min(82, Math.round(48 + riskModifier * 0.95))),
      },
      {
        year: baseYear + 2,
        yield: parseFloat((4.25 + yieldImpact * 0.6).toFixed(1)),
        profit: Math.round(34100 + (yieldImpact * 8900) + (waterSavings * 240)),
        waterUse: Math.round(5900 - waterSavings * 35),
        riskScore: Math.max(24, Math.min(76, Math.round(39 + riskModifier * 0.8))),
      },
    ];

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

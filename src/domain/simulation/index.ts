/**
 * SIMULATION DOMAIN MODEL
 * Types that define simulation inputs, outputs, and lifecycle.
 */

export type Year = number;

export interface SimulationInput {
  readonly scenarioId?: string;
  readonly startYear?: Year;
  readonly endYear?: Year;
  readonly year?: Year;
  readonly rainfallDelta?: number;
  readonly salinityDelta?: number;
  readonly awdAdoption?: number;
  readonly parameters?: Record<string, number>;
  readonly resolution?: 'annual' | 'seasonal';
}

export interface SimulationOutput {
  readonly year: Year;
  readonly metrics: Record<string, number>;   // e.g. yield, profit, risk
  readonly confidence: number;
}

export interface SimulationMetrics {
  readonly yield: number;
  readonly profit: number;
  readonly waterUse: number;
  readonly riskScore: number;
  readonly [key: string]: number;
}

export interface SimulationStatus {
  readonly id: string;
  readonly status: 'idle' | 'queued' | 'running' | 'complete' | 'cancelled' | 'error';
  readonly progress: number;                  // 0-100
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly error?: string;
}

export interface SimulationProgress extends SimulationStatus {
  readonly currentYear?: Year;
  readonly estimatedTimeRemainingMs?: number;
}

export interface SimulationResult {
  readonly year: number;
  readonly yield: number;
  readonly profit: number;
  readonly waterUse: number;
  readonly riskScore: number;
}

export interface SimulationState {
  isRunning: boolean;
  progress: number;
  results: SimulationResult[];
  status: 'idle' | 'running' | 'complete' | 'error';
}

export interface SimulationComparison {
  readonly baseline: SimulationResult;
  readonly variant: SimulationResult;
  readonly deltas: Record<string, number>;
}

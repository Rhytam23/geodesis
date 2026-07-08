/**
 * SCENARIOS DOMAIN MODEL
 * Core types for creating, running, and comparing future scenarios.
 */

import { Year } from '../../integrations/types';

export interface ScenarioParameter {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly baseYear: Year;
  readonly horizonYear: Year;
  readonly parameters: ScenarioParameter[];
  readonly status: 'draft' | 'saved' | 'running' | 'complete' | 'error';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags?: string[];
}

export interface ScenarioPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, number>;
  readonly category: 'baseline' | 'climate' | 'policy' | 'extreme';
}

export interface ScenarioSnapshot {
  readonly scenarioId: string;
  readonly year: Year;
  readonly metrics: Record<string, number>;
  readonly confidence: number;
}

export interface ScenarioComparison {
  readonly baselineId: string;
  readonly comparisonId: string;
  readonly deltas: Array<{
    metric: string;
    baseline: number;
    comparison: number;
    delta: number;
    deltaPercent: number;
  }>;
}

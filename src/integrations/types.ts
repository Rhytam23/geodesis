/**
 * Geodesis Integration Layer - Core Types
 * 
 * This file now acts as a thin adapter contract layer.
 * All canonical domain types come from `@/domain`.
 * 
 * Adapters should return domain types where possible.
 */

// Re-export the full Digital Twin Domain Model
export * from '../domain';

// Legacy / Adapter-specific aliases (for smooth transition)
export type {
  MapLocation,
  MapLayer,
  MapState,
} from '../domain/geography';

export type {
  Recommendation,
  DecisionState,
} from '../domain'; // TODO: move Decision to domain/decision in future

export type {
  EconomicSummary,
  EconomicState,
} from '../domain/economy';

export type {
  SimulationInput,
  SimulationResult,
  SimulationState,
} from '../domain/simulation';

export type {
  TimelineState,
} from '../domain/timeline';

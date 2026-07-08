/**
 * Geodesis Integration Layer - Public API
 * 
 * Single entry point for all adapters.
 * UI should only import from here.
 */

export * from './types';

export { MapAdapter } from './map/MapAdapter';
export { DecisionAdapter } from './decision/DecisionAdapter';
export { EconomicAdapter } from './economics/EconomicAdapter';
export { SimulationAdapter } from './simulation/SimulationAdapter';
export { TimelineAdapter } from './timeline/TimelineAdapter';

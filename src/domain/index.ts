/**
 * GEODESIS DOMAIN MODEL - SINGLE SOURCE OF TRUTH
 * 
 * All domain types for the Geospatial Digital Twin.
 * 
 * Every feature (GIS, Timeline, Simulation, AI, Reports) must use these types.
 * 
 * Import from here:
 *   import { Region, Scenario, SimulationResult } from '@/domain';
 */

// Geography
export * from './geography';

// Hazards
export * from './hazards';

// Indicators
export * from './indicators';

// Scenarios
export * from './scenarios';

// Simulation
export * from './simulation';

// Timeline
export * from './timeline';

// Assets
export * from './assets';

// Economy
export * from './economy';

// Decision / AI
export * from './decision';

// Core primitives (defined locally to prevent circularity with integrations)
export type Year = number;

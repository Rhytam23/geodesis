/**
 * HAZARDS DOMAIN MODEL
 * Canonical representation of all hazard types and risk data.
 */

export type HazardType = 
  | 'flood' 
  | 'drought' 
  | 'salinity' 
  | 'cyclone' 
  | 'heatwave' 
  | 'landslide';

export type Severity = 'low' | 'medium' | 'high' | 'extreme';
export type Trend = 'improving' | 'stable' | 'worsening';

export interface Hazard {
  readonly type: HazardType;
  readonly severity: Severity;
  readonly confidence: number;        // 0-100
  readonly trend: Trend;
  readonly affectedAreaHa: number;
  readonly recommendedAction?: string;
  readonly lastAssessed: string;      // ISO date
}

export interface FloodRisk extends Hazard {
  readonly type: 'flood';
  readonly waterLevelM: number;
  readonly returnPeriodYears: number;
}

export interface DroughtRisk extends Hazard {
  readonly type: 'drought';
  readonly rainfallDeficitPercent: number;
  readonly durationDays: number;
}

export interface SalinityRisk extends Hazard {
  readonly type: 'salinity';
  readonly dSPerMeter: number;
  readonly affectedCropTypes: string[];
}

export interface CycloneRisk extends Hazard {
  readonly type: 'cyclone';
  readonly windSpeedKmh: number;
  readonly stormSurgeM?: number;
}

export interface HeatwaveRisk extends Hazard {
  readonly type: 'heatwave';
  readonly maxTempC: number;
  readonly durationDays: number;
}

export type AnyHazard = 
  | FloodRisk 
  | DroughtRisk 
  | SalinityRisk 
  | CycloneRisk 
  | HeatwaveRisk;

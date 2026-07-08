/**
 * ASSETS DOMAIN MODEL
 * Canonical types for physical and critical infrastructure assets.
 */

import { Coordinate } from '../geography';

export type AssetType =
  | 'road'
  | 'hospital'
  | 'school'
  | 'bridge'
  | 'power_grid'
  | 'water_network'
  | 'emergency_center'
  | 'shelter'
  | 'irrigation'
  | 'port';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type AssetStatus = 'operational' | 'degraded' | 'damaged' | 'offline';

export interface Asset {
  readonly id: string;
  readonly name: string;
  readonly type: AssetType;
  readonly location: Coordinate;
  readonly condition: AssetCondition;
  readonly capacity?: number;
  readonly capacityUnit?: string;
  readonly riskScore: number;           // 0-100
  readonly status: AssetStatus;
  readonly lastInspected?: string;
  readonly regionId: string;
}

export interface RoadAsset extends Asset {
  readonly type: 'road';
  readonly lengthKm: number;
  readonly surfaceType: string;
}

export interface HospitalAsset extends Asset {
  readonly type: 'hospital';
  readonly bedCount: number;
  readonly emergencyCapacity: number;
}

export interface PowerGridAsset extends Asset {
  readonly type: 'power_grid';
  readonly capacityMW: number;
  readonly connectedPopulation?: number;
}

export type AnyAsset = 
  | RoadAsset 
  | HospitalAsset 
  | PowerGridAsset 
  | Asset;

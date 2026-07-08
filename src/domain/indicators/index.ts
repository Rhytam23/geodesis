/**
 * INDICATORS DOMAIN MODEL
 * Canonical domain types for all measurable indicators in the Digital Twin.
 */

export type IndicatorCategory =
  | 'population'
  | 'infrastructure'
  | 'economy'
  | 'healthcare'
  | 'environment'
  | 'transportation'
  | 'water'
  | 'energy'
  | 'agriculture';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface IndicatorValue {
  readonly current: number;
  readonly predicted?: number;
  readonly unit: string;
  readonly confidence: number; // 0-100
  readonly trend: TrendDirection;
  readonly lastUpdated: string;
}

export interface BaseIndicator {
  readonly id: string;
  readonly name: string;
  readonly category: IndicatorCategory;
  readonly value: IndicatorValue;
  readonly regionId: string;
  readonly source: string;
}

export interface PopulationIndicator extends BaseIndicator {
  readonly category: 'population';
  readonly value: IndicatorValue & { current: number; unit: 'people' };
}

export interface AgricultureIndicator extends BaseIndicator {
  readonly category: 'agriculture';
  readonly value: IndicatorValue & { unit: 't/ha' | 'kg/ha' | '%' };
  readonly cropType?: string;
}

export interface WaterIndicator extends BaseIndicator {
  readonly category: 'water';
  readonly value: IndicatorValue & { unit: 'mm' | 'm3' | 'dS/m' };
}

export interface EconomyIndicator extends BaseIndicator {
  readonly category: 'economy';
  readonly value: IndicatorValue & { unit: 'USD' | '%' | 'index' };
}

export type AnyIndicator =
  | PopulationIndicator
  | AgricultureIndicator
  | WaterIndicator
  | EconomyIndicator
  | BaseIndicator;

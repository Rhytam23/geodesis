/**
 * ECONOMY DOMAIN MODEL
 * Economic indicators and impact types.
 */

export interface EconomicSummary {
  readonly projectedRevenue: number;
  readonly costSavings: number;
  readonly netImpact: number;
  readonly paybackMonths: number;
  readonly subsidyEligible: boolean;
  readonly currency?: 'USD' | 'VND';
}

export interface EconomicState {
  readonly summary: EconomicSummary;
  readonly marketIndicators: {
    readonly priceIndex: number;
    readonly demandTrend: 'up' | 'stable' | 'down';
  };
}

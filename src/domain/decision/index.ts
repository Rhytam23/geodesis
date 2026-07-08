/**
 * DECISION DOMAIN MODEL
 * Types for AI / Decision Intelligence outputs.
 */

export interface Recommendation {
  readonly id: string;
  readonly crop: string;
  readonly confidence: number;
  readonly yieldImpact: number;
  readonly waterSavings: number;
  readonly reason: string;
}

export interface DecisionState {
  readonly recommendations: Recommendation[];
  readonly overallConfidence: number;
  readonly lastUpdated: string;
}

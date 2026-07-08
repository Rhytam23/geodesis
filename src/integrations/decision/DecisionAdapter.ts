/**
 * DecisionAdapter - now uses domain types
 */

import { DecisionState, Recommendation } from '../../domain'; // will be moved later

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec1',
    crop: 'Salt-Tolerant Rice (ST25)',
    confidence: 87,
    yieldImpact: 18,
    waterSavings: 31,
    reason: 'High salinity tolerance + strong market price',
  },
  {
    id: 'rec2',
    crop: 'AWD + Salt Tolerant Variety',
    confidence: 79,
    yieldImpact: 12,
    waterSavings: 38,
    reason: 'Best water efficiency under projected drought',
  },
];

export class DecisionAdapter {
  private state: DecisionState = {
    recommendations: MOCK_RECOMMENDATIONS,
    overallConfidence: 83,
    lastUpdated: '2026-07-07 09:41',
  };

  async getRecommendations(): Promise<Recommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 30));
    return [...this.state.recommendations];
  }

  getCurrentDecisionState(): DecisionState {
    return {
      ...this.state,
      recommendations: [...this.state.recommendations],
    };
  }
}

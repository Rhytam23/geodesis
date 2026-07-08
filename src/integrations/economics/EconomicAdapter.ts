/**
 * EconomicAdapter
 * 
 * Adapter for economic and market data.
 * Pure mock data.
 */

import { EconomicState, EconomicSummary } from '../types';

const MOCK_SUMMARY: EconomicSummary = {
  projectedRevenue: 124800,
  costSavings: 18400,
  netImpact: 31200,
  paybackMonths: 14,
  subsidyEligible: true,
};

export class EconomicAdapter {
  private state: EconomicState = {
    summary: MOCK_SUMMARY,
    marketIndicators: {
      priceIndex: 108,
      demandTrend: 'up',
    },
  };

  async getEconomicSummary(): Promise<EconomicSummary> {
    await new Promise(resolve => setTimeout(resolve, 20));
    return { ...this.state.summary };
  }

  getCurrentEconomicState(): EconomicState {
    return {
      summary: { ...this.state.summary },
      marketIndicators: { ...this.state.marketIndicators },
    };
  }
}

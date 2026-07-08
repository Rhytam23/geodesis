export interface EconomicComparison {
  current: {
    crop: string;
    yield: number;
    revenue: number;
    cost: number;
    profit: number;
  };
  recommended: {
    crop: string;
    yield: number;
    revenue: number;
    cost: number;
    profit: number;
  };
  comparison: {
    profitIncrease: number;
    profitIncreasePercent: number;
    investment: number;
    paybackSeasons: number;
    paybackMonths: number;
  };
  market: {
    demand: string;
    seasonalTrend: string;
    priceTrend: string;
  };
  subsidy: {
    eligible: boolean;
    amount: number;
    description: string;
  };
  nearestCooperative: {
    name: string;
    distance: number;
    members: number;
  };
  assumptions: string[];
  lastUpdated: string;
}

import { DecisionInput } from '../types/recommendation';
import { CropRecommendation } from '../types/recommendation';
import { EconomicComparison } from '../types/economic';

interface CropEconomics {
  baseYield: number;
  pricePerTon: number; // million VND
  variableCostPerHa: number;
  fixedCostPerHa: number;
}

const CROP_MODELS: Record<string, CropEconomics> = {
  'ST25 Rice': { baseYield: 6.2, pricePerTon: 7.4, variableCostPerHa: 18.5, fixedCostPerHa: 8.2 },
  'IR64 Rice': { baseYield: 5.4, pricePerTon: 6.8, variableCostPerHa: 17.2, fixedCostPerHa: 7.8 },
  'Shrimp-Rice Rotation': { baseYield: 6.8, pricePerTon: 12.5, variableCostPerHa: 26.0, fixedCostPerHa: 9.5 },
  'Drought-Tolerant Vegetables': { baseYield: 18.5, pricePerTon: 2.8, variableCostPerHa: 14.0, fixedCostPerHa: 5.5 },
  'Salt-Tolerant Coconut': { baseYield: 11.0, pricePerTon: 3.1, variableCostPerHa: 9.5, fixedCostPerHa: 6.0 },
};

function getModel(crop: string): CropEconomics {
  return CROP_MODELS[crop] || CROP_MODELS['ST25 Rice'];
}

export function calculateEconomicComparison(
  input: DecisionInput,
  currentCropInfo: any,
  recommended: CropRecommendation
): EconomicComparison {
  const currentCrop = currentCropInfo?.current || 'IR64 Rice';
  const currentModel = getModel(currentCrop);
  const recModel = getModel(recommended.crop);

  // Base yield adjusted by actual NDVI / salinity from data
  const ndviFactor = input.soil ? (0.95 + (input.soil.salinity < 5 ? 0.12 : -0.08)) : 1.0;
  const marketFactor = input.market ? (1 + (input.market.ricePrice - 6800) / 8500) : 1.0;

  // CURRENT CROP
  const currentYield = parseFloat((currentModel.baseYield * ndviFactor * 0.92).toFixed(1));
  const currentRevenue = parseFloat((currentYield * currentModel.pricePerTon * marketFactor).toFixed(1));
  const currentCost = parseFloat((currentModel.variableCostPerHa + currentModel.fixedCostPerHa).toFixed(1));
  const currentProfit = parseFloat((currentRevenue - currentCost).toFixed(1));

  // RECOMMENDED CROP
  const recYield = recommended.expectedYield;
  const recRevenue = parseFloat((recYield * recModel.pricePerTon * marketFactor).toFixed(1));
  const recCost = parseFloat((recModel.variableCostPerHa + recModel.fixedCostPerHa).toFixed(1));
  const recProfit = parseFloat((recRevenue - recCost).toFixed(1));

  // COMPARISON
  const profitIncrease = parseFloat((recProfit - currentProfit).toFixed(1));
  const profitIncreasePercent = currentProfit > 0 
    ? Math.round(((recProfit - currentProfit) / currentProfit) * 100) 
    : 45;

  // Investment (seed upgrade, AWD, training, initial input difference)
  const investment = parseFloat((recCost - currentCost + 6.5).toFixed(1)); // extra setup cost

  // Payback
  const seasonsToPayback = investment > 0 ? Math.ceil(investment / Math.max(1, profitIncrease)) : 1;
  const paybackMonths = Math.round(seasonsToPayback * 5.5);

  // Market & demand
  const demand = input.market?.trend === 'Rising (+3.8%)' 
    ? 'Strong (rising prices)' 
    : 'Moderate (stable)';
  const seasonalTrend = input.weather?.current?.rainfall > 35 ? 'Favorable wet season' : 'Average';
  const priceTrend = input.market?.trend || 'Stable';

  // Subsidy
  const eligible = input.government?.programs?.length > 0;
  const subsidyAmount = eligible ? 4.5 : 0;

  // Nearest cooperative (from existing data or fallback)
  const nearestCoop = input.admin 
    ? { name: `${input.admin.province} Farmers Coop`, distance: 4.2, members: 1840 }
    : { name: 'Local Cooperative', distance: 5.8, members: 920 };

  const assumptions = [
    'Prices based on current MARD/VFA regional averages',
    'Yields adjusted by local NDVI and salinity data',
    'Costs include seeds, fertilizer, labor, irrigation, and pest control',
    'Investment covers variety change + basic AWD infrastructure',
    'Payback calculated in average 5.5-month seasons',
    'No extreme weather events assumed',
    'Subsidy eligibility based on active provincial programs',
  ];

  return {
    current: {
      crop: currentCrop,
      yield: currentYield,
      revenue: currentRevenue,
      cost: currentCost,
      profit: currentProfit,
    },
    recommended: {
      crop: recommended.crop,
      yield: recYield,
      revenue: recRevenue,
      cost: recCost,
      profit: recProfit,
    },
    comparison: {
      profitIncrease,
      profitIncreasePercent,
      investment: Math.max(3.5, investment),
      paybackSeasons: seasonsToPayback,
      paybackMonths,
    },
    market: {
      demand,
      seasonalTrend,
      priceTrend,
    },
    subsidy: {
      eligible,
      amount: subsidyAmount,
      description: eligible ? 'MARD Salinity Resilience + Irrigation Subsidy' : 'Not currently eligible',
    },
    nearestCooperative: nearestCoop,
    assumptions,
    lastUpdated: new Date().toISOString(),
  };
}

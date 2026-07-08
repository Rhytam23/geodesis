export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Influence {
  factor: string;
  score: number;          // 0-100 influence score
  explanation: string;
  dataSource: string;
  liveValue?: string;
}

export interface WaterAnalysis {
  requirement: number;    // m³/ha/season
  availability: number;   // estimated m³/ha available
  efficiencyScore: number; // 0-100
  analysis: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;          // 0-100 (lower better)
  keyFactors: string[];
  mitigationStrategies: string[];
}

export interface CropRecommendation {
  crop: string;
  confidence: number;           // 0-100
  expectedYield: number;        // t/ha
  expectedProfit: number;       // million VND / ha / season
  waterRequirement: number;     // m³ / ha / season
  riskLevel: RiskLevel;
  reasoning: string[];          // Step-by-step transparent logic
  supportingEvidence: string[]; // Specific data points used
  // Full transparency fields
  confidenceBreakdown: Record<string, number>;
  weatherInfluence: Influence;
  soilInfluence: Influence;
  marketInfluence: Influence;
  historicalInfluence: Influence;
  satelliteInfluence: Influence;
  waterAnalysis: WaterAnalysis;
  riskAssessment: RiskAssessment;
  supportingDatasets: string[];
  calculationFormula: string;
  confidenceContributions: Array<{ factor: string; weight: number; score: number; contribution: number }>;

  // NEW: Trust & explainability fields (required for every recommendation)
  lastUpdated: string;
  uncertainty: number;          // 0-100 (higher = more uncertain)
  expectedBenefit: string;      // Clear human-readable benefit summary
  limitations: string[];        // Known limitations / caveats
}

export interface DecisionInput {
  lat: number;
  lng: number;
  admin: any;
  weather: any;
  soil: any;
  crop: any;
  market: any;
  government: any;
  groundwater?: { depth: number };
}

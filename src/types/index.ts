export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'cooperative' | 'government' | 'researcher';
  location: string;
  phone?: string;
  organization?: string;
}

export interface SatelliteDataPoint {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  salinity: number;
  ndvi: number;
  rainfall: number;
  soilMoisture: number;
  groundwater: number;
  temperature: number;
  source: string;
}

export interface Prediction {
  id: string;
  crop: string;
  location: string;
  expectedYield: number; // tons/ha
  expectedIncome: number; // VND millions
  waterSavings: number; // %
  confidence: number; // 0-100
  uncertainty: number; // %
  date: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: 'irrigation' | 'crop' | 'timing' | 'mitigation';
  confidence: number;
  reasoning: string[];
  supportingDatasets: string[];
  expectedYield: number;
  expectedIncome: number;
  waterSavings: number;
  uncertainty: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  predictedOutcome: string;
}

export interface Province {
  id: string;
  name: string;
  region: string;
  area: number;
  salinityRisk: number;
  ndviAvg: number;
  farmers: number;
  lat: number;
  lng: number;
}

export interface LayerConfig {
  id: string;
  name: string;
  type: 'heatmap' | 'polygon' | 'vector';
  active: boolean;
  opacity: number;
  color?: string;
  dataSource: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  duration: number;
  dataSource?: string;
}

export interface HistoricalEvent {
  id: string;
  year: number;
  name: string;
  description: string;
  affectedProvinces: string[];
  peakSalinity: number;
  yieldLoss: number;
  keyMetrics: Record<string, number>;
}

export interface DashboardMetrics {
  totalArea: number;
  activeAlerts: number;
  avgConfidence: number;
  predictedYield: number;
  economicImpact: number;
}

export interface SMSAlert {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'sent' | 'scheduled' | 'delivered';
}

export interface ClimateLayerData {
  salinity: SatelliteDataPoint[];
  rainfall: SatelliteDataPoint[];
  ndvi: SatelliteDataPoint[];
  groundwater: SatelliteDataPoint[];
}

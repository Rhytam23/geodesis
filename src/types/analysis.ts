export interface LocationAnalysis {
  lat: number;
  lng: number;
  province: string;
  district: string;
  commune: string;
  elevation: number;
  area: number;

  weather: {
    current: { temp: number; humidity: number; wind: number; condition: string };
    forecast: Array<{ day: string; temp: number; rain: number; condition: string }>;
  };

  soil: {
    type: string;
    ph: number;
    organicMatter: number;
    texture: string;
    salinity: number;
  };

  groundwater: {
    depth: number;
    quality: string;
    trend: string;
  };

  vegetation: {
    ndvi: number;
    ndwi: number;
    evi: number;
    status: string;
  };

  risks: {
    flood: number; // 0-100
    drought: number;
    salinityIntrusion: number;
    subsidence: number;
  };

  crops: {
    current: string;
    stage: string;
    daysSincePlanting: number;
  };

  market: {
    ricePrice: number;
    shrimpPrice: number;
    vegetablePrice: number;
    trend: string;
  };

  cooperatives: Array<{ name: string; distance: number; members: number }>;
  support: string[];
}

export interface CropRecommendation {
  crop: string;
  confidence: number;
  expectedYield: number;
  expectedProfit: number; // millions VND / ha
  waterRequirement: number; // m3/ha/season
  riskLevel: 'Low' | 'Medium' | 'High';
  why: string[];
  ndviFit: number;
  marketFit: number;
}

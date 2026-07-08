import { Province, SatelliteDataPoint, HistoricalEvent, Recommendation, SMSAlert, User } from '../types';

// DEMONSTRATION GEOGRAPHIC REFERENCE DATA
// Real province names + approximate centroids (public data)
// salinityRisk, ndviAvg, farmers, area = realistic demonstration values based on 2023-2025 MARD / MONRE reports
export const provinces: Province[] = [
  { id: 'p1', name: 'An Giang', region: 'Upper Mekong', area: 3536, salinityRisk: 62, ndviAvg: 0.68, farmers: 142000, lat: 10.521, lng: 105.126 },
  { id: 'p2', name: 'Dong Thap', region: 'Upper Mekong', area: 3377, salinityRisk: 55, ndviAvg: 0.71, farmers: 98000, lat: 10.463, lng: 105.632 },
  { id: 'p3', name: 'Kien Giang', region: 'Lower Mekong', area: 6348, salinityRisk: 87, ndviAvg: 0.54, farmers: 167000, lat: 9.953, lng: 105.152 },
  { id: 'p4', name: 'Can Tho', region: 'Central Mekong', area: 1439, salinityRisk: 41, ndviAvg: 0.73, farmers: 73000, lat: 10.045, lng: 105.746 },
  { id: 'p5', name: 'Soc Trang', region: 'Lower Mekong', area: 3312, salinityRisk: 84, ndviAvg: 0.51, farmers: 124000, lat: 9.603, lng: 105.973 },
  { id: 'p6', name: 'Tra Vinh', region: 'Lower Mekong', area: 2295, salinityRisk: 78, ndviAvg: 0.57, farmers: 85000, lat: 9.933, lng: 106.340 },
  { id: 'p7', name: 'Ben Tre', region: 'Lower Mekong', area: 2360, salinityRisk: 79, ndviAvg: 0.59, farmers: 93000, lat: 10.233, lng: 106.375 },
  { id: 'p8', name: 'Tien Giang', region: 'Central Mekong', area: 2484, salinityRisk: 66, ndviAvg: 0.64, farmers: 104000, lat: 10.353, lng: 106.361 },
  { id: 'p9', name: 'Vinh Long', region: 'Central Mekong', area: 1505, salinityRisk: 49, ndviAvg: 0.69, farmers: 64000, lat: 10.251, lng: 105.972 },
  { id: 'p10', name: 'Long An', region: 'Upper Mekong', area: 4494, salinityRisk: 35, ndviAvg: 0.76, farmers: 118000, lat: 10.651, lng: 106.260 },
];

// All generated satellite / heatmap data below is **demonstration data** derived from the above reference.

export const currentUsers: User[] = [
  { id: 'u1', name: 'Nguyen Van Minh', role: 'farmer', location: 'An Giang, Chau Doc', phone: '+84 901 234 567' },
  { id: 'u2', name: 'Tran Thi Lan', role: 'cooperative', location: 'Kien Giang', phone: '+84 912 456 789', organization: 'Kien Giang Rice Cooperative' },
  { id: 'u3', name: 'Dr. Pham Quang Huy', role: 'government', location: 'Hanoi / Can Tho', phone: '+84 935 111 222', organization: 'Ministry of Agriculture (MARD)' },
  { id: 'u4', name: 'Dr. Le Thi Mai', role: 'researcher', location: 'Can Tho University', phone: '+84 903 888 111', organization: 'Mekong Delta Research Institute' },
];

export const satelliteSources = [
  'Sentinel-1 (SAR)',
  'Sentinel-2 (MSI)',
  'CHIRPS (Rainfall)',
  'NASA MODIS (LST/NDVI)',
  'MONRE Ground Station',
  'Google Earth Engine',
];

// DEMONSTRATION SATELLITE DATA GENERATOR
// All values below are **synthetic demonstration data** derived deterministically from province reference data.
// They simulate Sentinel-1/2 + CHIRPS + MODIS style outputs for the Mekong Delta.
export const generateSatelliteData = (date: string = '2026-07-03'): SatelliteDataPoint[] => {
  const basePoints: SatelliteDataPoint[] = [];
  
  provinces.forEach((prov, i) => {
    const baseLat = prov.lat;
    const baseLng = prov.lng;
    
    // Deterministic points (no Math.random) — stable for demo
    for (let j = 0; j < 4; j++) {
      const seed = (i * 17 + j * 7) % 11;
      const lat = baseLat + (seed - 5) * 0.068;
      const lng = baseLng + ((j * 3) % 7 - 3) * 0.072;
      
      const salinity = Math.max(0.1, Math.min(12, prov.salinityRisk / 10 + (seed - 5) * 0.35));
      const ndvi = Math.max(0.2, Math.min(0.94, prov.ndviAvg + (j - 2) * 0.028));
      const rainfall = Math.max(1, Math.min(85, 42 + (seed - 4) * 5.5));
      const soilMoisture = Math.max(11, Math.min(72, 41 + (j - 1) * 4.5));
      const groundwater = Math.max(0.3, Math.min(4.8, 2.1 + (seed - 5) * 0.22));
      const temperature = Math.max(23, Math.min(36, 29.8 + (j - 2) * 0.9));
      
      basePoints.push({
        id: `sat-${prov.id}-${i}-${j}`,
        timestamp: date,
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        salinity: parseFloat(salinity.toFixed(1)),
        ndvi: parseFloat(ndvi.toFixed(3)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        soilMoisture: parseFloat(soilMoisture.toFixed(1)),
        groundwater: parseFloat(groundwater.toFixed(1)),
        temperature: parseFloat(temperature.toFixed(1)),
        source: satelliteSources[(i + j) % satelliteSources.length],
      });
    }
  });
  
  return basePoints;
};

export const currentSatelliteData: SatelliteDataPoint[] = generateSatelliteData();

export const historicalEvents: HistoricalEvent[] = [
  {
    id: 'he-2016',
    year: 2016,
    name: '2016 Mekong Salinity Intrusion Crisis',
    description: 'Extreme drought + tidal intrusion led to unprecedented salinity penetration deep into the Mekong Delta. Over 160,000 hectares severely impacted.',
    affectedProvinces: ['Kien Giang', 'Soc Trang', 'Tra Vinh', 'Ben Tre'],
    peakSalinity: 28.4,
    yieldLoss: 39,
    keyMetrics: { affectedArea: 162000, economicLoss: 5800, riceYieldDrop: 1.8 },
  },
  {
    id: 'he-2020',
    year: 2020,
    name: '2020 Severe Salinity Event',
    description: 'Record low rainfall combined with sea level rise caused salinity to reach 50km inland. Most destructive event of the last 10 years.',
    affectedProvinces: ['Kien Giang', 'Soc Trang', 'Ben Tre', 'Tien Giang', 'Tra Vinh'],
    peakSalinity: 31.7,
    yieldLoss: 44,
    keyMetrics: { affectedArea: 198000, economicLoss: 7100, riceYieldDrop: 2.1 },
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    title: 'Switch to ST25 Rice + Delayed Transplant',
    type: 'crop',
    confidence: 94,
    reasoning: [
      'High salinity detected in soil (7.1 dS/m) exceeds ST25 tolerance threshold',
      'CHIRPS rainfall forecast projects 18% below normal for next 45 days',
      'Sentinel-2 NDVI trend shows early stress signature in IR64 plots',
    ],
    supportingDatasets: ['Sentinel-2 (NDVI)', 'CHIRPS', 'MONRE Salinity'],
    expectedYield: 6.4,
    expectedIncome: 42.8,
    waterSavings: 24,
    uncertainty: 6,
    priority: 'high',
    action: 'Transplant ST25 variety by July 18th',
    predictedOutcome: 'Yield +0.9 t/ha vs current variety; 24% water savings',
  },
  {
    id: 'rec-002',
    title: 'Implement Alternate Wetting & Drying (AWD)',
    type: 'irrigation',
    confidence: 89,
    reasoning: [
      'Groundwater levels at 1.9m (optimal for AWD)',
      'Soil moisture is 43% — above AWD trigger point',
      'NASA MODIS evapotranspiration indicates excess irrigation',
    ],
    supportingDatasets: ['NASA MODIS', 'Sentinel-1 (SAR)', 'MONRE Groundwater'],
    expectedYield: 6.1,
    expectedIncome: 39.9,
    waterSavings: 38,
    uncertainty: 9,
    priority: 'high',
    action: 'Activate AWD schedule with 5-day irrigation interval',
    predictedOutcome: '38% water reduction; no significant yield loss expected',
  },
  {
    id: 'rec-003',
    title: 'Deploy Salinity Barriers + Early Harvest',
    type: 'mitigation',
    confidence: 82,
    reasoning: [
      'Current salinity front 19km inland; predicted to advance 8km within 12 days',
      'Historical 2020 model indicates similar trajectory',
      'Forecasted rainfall insufficient to dilute salinity',
    ],
    supportingDatasets: ['Sentinel-1', 'CHIRPS', 'Historical Event 2020'],
    expectedYield: 5.7,
    expectedIncome: 36.5,
    waterSavings: 11,
    uncertainty: 13,
    priority: 'medium',
    action: 'Install temporary barriers + harvest 9-12 days earlier',
    predictedOutcome: 'Minimize 27% yield loss; preserve 41% of crop value',
  },
];

export const mockSMSAlerts: SMSAlert[] = [
  {
    id: 'sms-1',
    recipient: 'Nguyen Van Minh',
    phone: '+84 901 234 567',
    message: 'ALERT: Salinity rising rapidly near Chau Doc. Switch to ST25 rice + delay transplant by 4 days. Expected yield +0.9t/ha. Reply CONFIRM to receive AWD instructions.',
    timestamp: '2026-07-03 08:14',
    priority: 'high',
    status: 'delivered',
  },
  {
    id: 'sms-2',
    recipient: 'Tran Thi Lan',
    phone: '+84 912 456 789',
    message: 'Kien Giang Coop: 87% of fields show high salinity. AWD recommended. 38% water savings projected. Full report: mekong.ai/kien-5',
    timestamp: '2026-07-03 07:51',
    priority: 'high',
    status: 'sent',
  },
  {
    id: 'sms-3',
    recipient: 'Provincial Officer',
    phone: '+84 935 111 222',
    message: 'MARD Dashboard: 6 provinces elevated salinity. 19k ha affected. Recommend deploying mobile salinity barriers in Soc Trang + Tra Vinh.',
    timestamp: '2026-07-03 09:05',
    priority: 'medium',
    status: 'delivered',
  },
];

export const pipelineSteps: { id: string; name: string; description: string; duration: number; dataSource?: string }[] = [
  { id: 's1', name: 'Satellite Acquisition', description: 'Ingest Sentinel-1, Sentinel-2, CHIRPS, MODIS', duration: 1200, dataSource: 'GEE' },
  { id: 's2', name: 'Data Validation', description: 'Cross-validation with MONRE ground truth + QA/QC', duration: 800, dataSource: 'MONRE' },
  { id: 's3', name: 'Preprocessing', description: 'Atmospheric correction, cloud masking, resampling', duration: 1400, dataSource: 'Sentinel' },
  { id: 's4', name: 'Feature Engineering', description: 'NDVI, EVI, salinity index, rainfall anomaly, soil moisture indices', duration: 900, dataSource: 'GEE' },
  { id: 's5', name: 'ML Prediction', description: 'XGBoost + LSTM ensemble for yield and salinity forecast', duration: 2100 },
  { id: 's6', name: 'Decision Intelligence', description: 'Multi-objective optimization & risk scoring', duration: 600 },
  { id: 's7', name: 'Economic Analysis', description: 'Yield → income → water cost modeling', duration: 500 },
  { id: 's8', name: 'Recommendation Engine', description: 'Explainable AI + scenario generation', duration: 700 },
];

export const getDashboardMetrics = (role: string): any => {
  const base = {
    totalArea: 28670,
    activeAlerts: 14,
    avgConfidence: 88,
    predictedYield: 5.8,
    economicImpact: 243,
  };
  
  if (role === 'farmer') return { ...base, totalArea: 4.2, activeAlerts: 2, economicImpact: 42 };
  if (role === 'cooperative') return { ...base, totalArea: 18700, activeAlerts: 9, economicImpact: 167 };
  if (role === 'government') return { ...base, totalArea: 28670, activeAlerts: 14, economicImpact: 418 };
  return { ...base, totalArea: 28670, activeAlerts: 11, avgConfidence: 91 };
};

export const generateLiveData = (): SatelliteDataPoint[] => {
  return generateSatelliteData(new Date().toISOString().split('T')[0]);
};

// Generate time-series for replay
export const getHistoricalTimeSeries = (year: number) => {
  const baseDate = `${year}-03-15`;
  const points = generateSatelliteData(baseDate);
  return points.map((p, idx) => ({
    ...p,
    timestamp: `${year}-0${Math.floor(idx / 12) + 3}-${String((idx % 28) + 1).padStart(2, '0')}`,
    salinity: Math.min(31, Math.max(0.5, p.salinity * (year === 2016 ? 2.1 : 1.8))),
    ndvi: Math.max(0.28, p.ndvi * 0.7),
  }));
};

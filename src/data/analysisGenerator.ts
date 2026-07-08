import { provinces } from './mockData';
import { LocationAnalysis, CropRecommendation } from '../types/analysis';

// DEMONSTRATION ANALYSIS GENERATOR
// All values are deterministic demo data derived from province reference + lat/lng.
// Clearly marked as demonstration.

export function generateAnalysis(lat: number, lng: number): LocationAnalysis {
  // Find closest province (reference data)
  let closest = provinces[0];
  let minDist = Infinity;
  
  provinces.forEach(p => {
    const dist = Math.hypot(p.lat - lat, p.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  });

  // Deterministic values based on coordinates + reference
  const seed = Math.floor(((lat * 100) + (lng * 10)) % 100);
  const baseSalinity = Math.max(0.4, Math.min(13.2, closest.salinityRisk / 9.5 + ((seed % 11) - 5) * 0.32));
  const ndvi = Math.max(0.29, Math.min(0.91, closest.ndviAvg + ((seed % 7) - 3) * 0.024));

  const districtNames = ['Chau Doc', 'Long Xuyen', 'Rach Gia', 'Ca Mau', 'Soc Trang', 'Ben Tre', 'Tra Vinh', 'Vinh Long', 'My Tho', 'Tan An'];
  const district = districtNames[(seed + Math.floor(lat * 3)) % districtNames.length];
  const communeNames = ['An Phu', 'Phu Tan', 'Giong Rieng', 'U Minh', 'Vinh Chau', 'Binh Dai', 'Cang Long', 'Tam Binh', 'Chau Thanh', 'Chau Thanh A'];
  const commune = communeNames[(seed * 3 + Math.floor(lng)) % communeNames.length];

  const temp = 27 + (seed % 11) - 4;
  const humidity = 72 + (seed % 19) - 8;
  const rainfall = 8 + (seed % 52);

  const weatherCondition = ['Partly Cloudy', 'Sunny', 'Light Rain', 'Overcast'][(seed + 2) % 4];

  return {
    lat: parseFloat(lat.toFixed(4)),
    lng: parseFloat(lng.toFixed(4)),
    province: closest.name,
    district,
    commune,
    elevation: Math.round(0.4 + (seed % 29) * 0.1),
    area: Math.round(18 + (seed % 210)),

    weather: {
      current: {
        temp: Math.round(temp),
        humidity: Math.round(humidity),
        wind: Math.round(7 + (seed % 9)),
        condition: weatherCondition,
      },
      forecast: [
        { day: 'Tomorrow', temp: Math.round(temp + 1), rain: 12, condition: 'Scattered showers' },
        { day: 'Day 2', temp: Math.round(temp + 3), rain: 0, condition: 'Sunny' },
        { day: 'Day 3', temp: Math.round(temp + 2), rain: 34, condition: 'Thunderstorms' },
      ],
    },

    soil: {
      type: ['Alluvial', 'Saline Clay', 'Silty Loam', 'Acid Sulfate'][(seed + 1) % 4],
      ph: parseFloat((4.7 + (seed % 23) * 0.1).toFixed(1)),
      organicMatter: parseFloat((1.8 + (seed % 24) * 0.1).toFixed(1)),
      texture: ['Loam', 'Clay Loam', 'Sandy Loam'][(seed) % 3],
      salinity: parseFloat(baseSalinity.toFixed(1)),
    },

    groundwater: {
      depth: parseFloat((0.9 + (seed % 31) * 0.1).toFixed(1)),
      quality: ['Good', 'Moderate', 'Saline'][(seed + 4) % 3],
      trend: (seed % 10) > 6 ? 'Declining (-1.8cm/yr)' : 'Stable',
    },

    vegetation: {
      ndvi,
      ndwi: Math.max(0.15, Math.min(0.68, 0.42 + ((seed % 7) - 3) * 0.022)),
      evi: parseFloat((ndvi * 0.88 + ((seed % 5) - 2) * 0.01).toFixed(3)),
      status: ndvi > 0.68 ? 'Healthy' : ndvi > 0.48 ? 'Moderate Stress' : 'High Stress',
    },

    risks: {
      flood: Math.round(Math.max(12, Math.min(91, closest.salinityRisk * 0.9 + ((seed % 11) - 5) * 2.6))),
      drought: Math.round(Math.max(8, Math.min(88, (100 - closest.ndviAvg * 100) + ((seed % 9) - 4) * 1.9))),
      salinityIntrusion: Math.round(Math.min(96, baseSalinity * 7.3)),
      subsidence: Math.round(2 + (seed % 11)),
    },

    crops: {
      current: ['ST25 Rice', 'IR64 Rice', 'Shrimp-Rice', 'Vegetables', 'Coconut'][(seed + 3) % 5],
      stage: ['Vegetative', 'Flowering', 'Grain Filling', 'Maturing'][(seed + 1) % 4],
      daysSincePlanting: Math.floor(12 + (seed % 88)),
    },

    market: {
      ricePrice: Math.round(6800 + (seed % 1200)),
      shrimpPrice: Math.round(138000 + (seed % 28000)),
      vegetablePrice: Math.round(18500 + (seed % 7000)),
      trend: (seed % 10) > 4 ? 'Rising (+4.2%)' : 'Stable',
    },

    cooperatives: [
      { name: `${closest.name} Agri Cooperative`, distance: 2.4, members: 1840 },
      { name: 'Mekong Delta Farmers Union', distance: 8.7, members: 9200 },
    ],

    support: [
      'MARD Salinity Resilience Program 2026',
      'Provincial Irrigation Subsidy',
      'Climate Smart Agriculture Credit (VBARD)',
    ],

    rainfall: rainfall,
    season: 'Wet Season 2026',
  } as any;
}

export function generateCropRecommendations(analysis: LocationAnalysis): CropRecommendation[] {
  const baseYield = 5.1 + (analysis.vegetation.ndvi - 0.5) * 3.8;
  const salinityImpact = Math.max(0, (analysis.soil.salinity - 3.5) * -0.4);

  // DEMONSTRATION recommendations — deterministic scoring
  const seed = Math.floor((analysis.lat + analysis.lng) * 100) % 100;

  const recommendations: CropRecommendation[] = [
    {
      crop: 'ST25 Rice',
      confidence: Math.round(87 + (seed % 11)),
      expectedYield: parseFloat((baseYield - salinityImpact + 0.8).toFixed(1)),
      expectedProfit: Math.round(31 + (baseYield * 1.8) + (analysis.market.ricePrice - 6800) / 120),
      waterRequirement: 5200,
      riskLevel: analysis.soil.salinity > 5.5 ? 'Medium' : 'Low',
      why: [
        'Excellent salinity tolerance for ST25 variety',
        'Strong market demand and premium pricing',
        'Good match with current NDVI and rainfall patterns',
        'Proven performance in 2020 salinity events',
      ],
      ndviFit: 88,
      marketFit: 93,
    },
    {
      crop: 'Shrimp-Rice Rotation',
      confidence: Math.round(79 + ((seed + 4) % 13)),
      expectedYield: parseFloat((5.9 + (analysis.soil.salinity - 4) * 0.3).toFixed(1)),
      expectedProfit: Math.round(67 + (analysis.soil.salinity * 2.4)),
      waterRequirement: 3100,
      riskLevel: analysis.soil.salinity > 6 ? 'Low' : 'Medium',
      why: [
        'Salinity levels ideal for integrated shrimp farming',
        'High market value for both rice and shrimp',
        'Reduces water use by 35% compared to rice monoculture',
        'Aligns with government integrated farming subsidies',
      ],
      ndviFit: 71,
      marketFit: 94,
    },
    {
      crop: 'Drought-Tolerant Vegetables',
      confidence: Math.round(73 + ((seed + 2) % 15)),
      expectedYield: 18.2,
      expectedProfit: 49,
      waterRequirement: 1850,
      riskLevel: 'Medium',
      why: [
        'High water efficiency in projected dry conditions',
        'Strong local and export market prices',
        'Rapid cycle allows multiple harvests per season',
        'Lower salinity exposure risk during early growth',
      ],
      ndviFit: 64,
      marketFit: 82,
    },
    {
      crop: 'Salt-Tolerant Coconut',
      confidence: Math.round(64 + ((seed + 7) % 17)),
      expectedYield: 11.4,
      expectedProfit: 28,
      waterRequirement: 2600,
      riskLevel: 'Low',
      why: [
        'Extremely high salinity tolerance',
        'Long-term resilient income stream',
        'Low maintenance and labor cost',
        'Intercropping potential with vegetables',
      ],
      ndviFit: 58,
      marketFit: 69,
    }
  ];

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export function getLocationName(lat: number, lng: number): string {
  const closest = provinces.reduce((prev, curr) => {
    const d1 = Math.hypot(prev.lat - lat, prev.lng - lng);
    const d2 = Math.hypot(curr.lat - lat, curr.lng - lng);
    return d1 < d2 ? prev : curr;
  });
  return `${closest.name} Province`;
}

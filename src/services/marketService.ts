export interface MarketData {
  ricePrice: number;      // VND / kg
  shrimpPrice: number;    // VND / kg
  vegetablePrice: number; // VND / kg
  trend: string;
  source: string;
  lastUpdated: string;
  confidence: number;
}

const cache = new Map<string, { data: MarketData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 min

// Stable realistic 2026 Mekong prices (demonstration values based on MARD / VFA 2025 averages)
function computeStableMarket(lat: number, lng: number): Omit<MarketData, 'source' | 'lastUpdated' | 'confidence'> {
  // Deterministic variation from coordinates
  const riceBase = 7150;
  const riceVar = Math.round((lat - 9.8) * 95 - (lng - 105.8) * 55);
  const ricePrice = riceBase + riceVar;

  const shrimpBase = 136500;
  const shrimpVar = Math.round((lat - 9.9) * 1800 + (lng - 105.6) * -1200);
  const shrimpPrice = shrimpBase + shrimpVar;

  const vegBase = 17100;
  const vegVar = Math.round((lat - 10.1) * 420 - (lng - 105.9) * 180);
  const vegetablePrice = vegBase + vegVar;

  // Stable trend based on location
  const trendSeed = ((lat * 17) + (lng * 11)) % 10;
  const trend = trendSeed > 6 ? 'Rising (+4.1%)' : trendSeed > 3 ? 'Stable' : 'Slightly declining (-1.8%)';

  return {
    ricePrice: Math.round(Math.max(6500, Math.min(8200, ricePrice))),
    shrimpPrice: Math.round(Math.max(118000, Math.min(162000, shrimpPrice))),
    vegetablePrice: Math.round(Math.max(14200, Math.min(21500, vegetablePrice))),
    trend,
  };
}

export async function getMarketData(lat: number, lng: number): Promise<MarketData> {
  const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  try {
    // In production this would call a real MARD / VFA API.
    // For demonstration we use stable, location-derived realistic prices.
    const computed = computeStableMarket(lat, lng);

    const data: MarketData = {
      ...computed,
      source: 'MARD + VFA (demonstration prices — 2025 regional averages)',
      lastUpdated: new Date().toISOString(),
      confidence: 76,
    };

    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch {
    const computed = computeStableMarket(lat, lng);
    const data: MarketData = {
      ...computed,
      source: 'MARD (demonstration data)',
      lastUpdated: new Date().toISOString(),
      confidence: 58,
    };
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}

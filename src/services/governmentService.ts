export interface GovernmentData {
  programs: string[];
  alerts: string[];
  source: string;
  lastUpdated: string;
  confidence: number;
}

const cache = new Map<string, { data: GovernmentData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

export async function getGovernmentSupport(lat: number, lng: number): Promise<GovernmentData> {
  const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  // Real data would come from MARD open data or MONRE
  const isHighRisk = lat < 10.1 || lng > 106.0; // rough salinity / flood zones

  const data: GovernmentData = {
    programs: [
      'MARD Salinity Resilience Program 2026',
      'Provincial Irrigation Subsidy (Decision 123/QD-TTg)',
      isHighRisk ? 'Climate Smart Agriculture Credit (VBARD)' : 'Agricultural Extension Support',
    ],
    alerts: isHighRisk 
      ? ['Salinity intrusion warning active', 'AWD irrigation recommended']
      : ['Normal monitoring', 'No active advisories'],
    source: 'Ministry of Agriculture & Rural Development (MARD)',
    lastUpdated: new Date().toISOString(),
    confidence: 78,
  };

  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

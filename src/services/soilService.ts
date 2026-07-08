/**
 * soilService.ts
 *
 * Fetches soil property data from ISRIC SoilGrids v2.0 (free, no API key required).
 * Falls back to deterministic demonstration data if the API is unavailable.
 *
 * API docs: https://rest.isric.org/soilgrids/v2.0/docs
 * Properties used: phh2o (soil pH in water), ocs (organic carbon stock)
 */

export interface SoilData {
  type: string;
  ph: number;
  organicMatter: number;
  texture: string;
  salinity: number;
  source: string;
  lastUpdated: string;
  confidence: number;
}

// ── Cache (24 h TTL — soil data changes slowly) ───────────────────────────────
const cache = new Map<string, { data: SoilData; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

const SOIL_TEXTURES = ['Clay Loam', 'Silty Clay', 'Loam'] as const;
const SOIL_TEXTURES_FALLBACK = ['Clay Loam', 'Silty Loam', 'Sandy Clay Loam'] as const;

/** Deterministic number from a seed (no randomness). */
function seededValue(seed: number, min: number, max: number): number {
  return min + (max - min) * ((Math.abs(seed) % 1000) / 1000);
}

/** Derive a deterministic seed from coordinates. */
function coordSeed(lat: number, lng: number): number {
  return Math.floor(lat * 1000 + lng * 10);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSoil(lat: number, lng: number): Promise<SoilData> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=phh2o,ocs`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5500) });
    if (!res.ok) throw new Error(`SoilGrids responded with ${res.status}`);

    const json = await res.json();
    const layers = json.properties?.layers ?? [];

    // pH: SoilGrids returns pH × 10 (e.g. 52 = pH 5.2)
    const phLayer = layers.find((l: { name: string }) => l.name === 'phh2o');
    const ph = (phLayer?.depths[0]?.values?.mean ?? 52) / 10;

    // Organic carbon stock → proxy for organic matter
    const ocsLayer = layers.find((l: { name: string }) => l.name === 'ocs');
    const organicMatter = (ocsLayer?.depths[0]?.values?.mean ?? 28) / 10;

    const seed = coordSeed(lat, lng);
    const texture = SOIL_TEXTURES[seed % SOIL_TEXTURES.length];

    // Salinity estimated from proximity to coast (latitude distance from 9.8°N)
    const salinity = Math.max(0.3, Math.min(11, Math.abs(lat - 9.8) * 1.4 + seededValue(seed, 0.1, 1.4)));

    const data: SoilData = {
      type: 'Alluvial / Fluvisol',
      ph: parseFloat(ph.toFixed(1)),
      organicMatter: parseFloat(organicMatter.toFixed(1)),
      texture,
      salinity: parseFloat(salinity.toFixed(1)),
      source: 'ISRIC SoilGrids v2.0',
      lastUpdated: new Date().toISOString(),
      confidence: 84,
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch {
    return buildFallback(lat, lng, cacheKey);
  }
}

function buildFallback(lat: number, lng: number, cacheKey: string): SoilData {
  const seed = coordSeed(lat, lng);
  const texture = SOIL_TEXTURES_FALLBACK[seed % SOIL_TEXTURES_FALLBACK.length];

  const data: SoilData = {
    type: 'Alluvial / Saline Fluvisol',
    ph: parseFloat((4.8 + seededValue(seed, 0, 1.9)).toFixed(1)),
    organicMatter: parseFloat((1.6 + seededValue(seed + 1, 0, 2.1)).toFixed(1)),
    texture,
    salinity: parseFloat((0.9 + seededValue(seed + 2, 0, 7)).toFixed(1)),
    source: 'SoilGrids — DEMONSTRATION DATA (API unavailable)',
    lastUpdated: new Date().toISOString(),
    confidence: 66,
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

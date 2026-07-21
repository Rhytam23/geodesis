/**
 * weatherService.ts
 *
 * Fetches real-time weather data from Open-Meteo (free, no API key required).
 * Falls back to deterministic demonstration data if the API is unavailable.
 *
 * API docs: https://open-meteo.com/en/docs
 */

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    wind: number;
    condition: string;
    rainfall: number;
  };
  forecast: Array<{
    day: string;
    temp: number;
    rain: number;
    condition: string;
  }>;
  source: string;
  lastUpdated: string;
  confidence: number;
}

// ── Cache (10 min TTL) ────────────────────────────────────────────────────────
const cache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 10;

// ── WMO weather code → human-readable label ───────────────────────────────────
const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  80: 'Rain Showers',
  95: 'Thunderstorm',
};

/** Deterministic number from a seed (no randomness). */
function seededValue(seed: number, min: number, max: number): number {
  return min + (max - min) * ((Math.abs(seed) % 1000) / 1000);
}

/** Derive a deterministic seed from coordinates. */
function coordSeed(lat: number, lng: number): number {
  return Math.floor(lat * 100 + lng * 10);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';

  if (apiKey) {
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&days=3&aqi=no&alerts=no`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!res.ok) throw new Error(`WeatherAPI responded with ${res.status}`);

      const json = await res.json();
      const data: WeatherData = {
        current: {
          temp: Math.round(json.current.temp_c),
          humidity: json.current.humidity,
          wind: Math.round(json.current.wind_kph),
          condition: json.current.condition.text,
          rainfall: Math.round(json.forecast.forecastday[0].day.totalprecip_mm ?? 0),
        },
        forecast: json.forecast.forecastday.slice(0, 3).map((f: any, i: number) => ({
          day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day +2',
          temp: Math.round(f.day.maxtemp_c),
          rain: Math.round(f.day.totalprecip_mm ?? 0),
          condition: f.day.condition.text,
        })),
        source: 'WeatherAPI.com',
        lastUpdated: new Date().toISOString(),
        confidence: 95,
      };

      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('WeatherAPI call failed, falling back to Open-Meteo:', error);
      }
    }
  }

  // ── Open-Meteo Fallback ───────────────────────────────────────────────────
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
    url.searchParams.set('daily', 'temperature_2m_max,precipitation_sum,weather_code');
    url.searchParams.set('timezone', 'Asia/Bangkok');
    url.searchParams.set('forecast_days', '3');

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(4500) });
    if (!res.ok) throw new Error(`Open-Meteo responded with ${res.status}`);

    const json = await res.json();
    const seed = coordSeed(lat, lng);

    const data: WeatherData = {
      current: {
        temp: Math.round(json.current.temperature_2m),
        humidity: Math.round(json.current.relative_humidity_2m),
        wind: Math.round(json.current.wind_speed_10m),
        condition: WMO_CONDITIONS[json.current.weather_code] ?? 'Partly Cloudy',
        rainfall: Math.round(
          json.daily.precipitation_sum?.[0] ?? seededValue(seed, 2, 18),
        ),
      },
      forecast: json.daily.time.slice(0, 3).map((_: unknown, i: number) => ({
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day +2',
        temp: Math.round(json.daily.temperature_2m_max[i]),
        rain: Math.round(json.daily.precipitation_sum[i] ?? 0),
        condition: WMO_CONDITIONS[json.daily.weather_code[i]] ?? 'Partly Cloudy',
      })),
      source: 'Open-Meteo (ECMWF)',
      lastUpdated: new Date().toISOString(),
      confidence: 91,
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch {
    // Graceful fallback — deterministic so UI stays consistent
    return buildFallback(lat, lng, cacheKey);
  }
}

function buildFallback(lat: number, lng: number, cacheKey: string): WeatherData {
  const seed = coordSeed(lat, lng);
  const temp = 27 + Math.round(seededValue(seed, -2.5, 2.5));

  const data: WeatherData = {
    current: {
      temp,
      humidity: 74 + Math.round(seededValue(seed + 1, -8, 8)),
      wind: 8 + Math.round(seededValue(seed + 2, 0, 7)),
      condition: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Overcast'][seed % 4],
      rainfall: Math.round(seededValue(seed + 3, 2, 22)),
    },
    forecast: [
      { day: 'Today', temp: temp + 1, rain: 8, condition: 'Light Rain' },
      { day: 'Tomorrow', temp: temp + 2, rain: 0, condition: 'Sunny' },
      { day: 'Day +2', temp: temp + 3, rain: 17, condition: 'Thunderstorm' },
    ],
    source: 'Open-Meteo — DEMONSTRATION DATA (API unavailable)',
    lastUpdated: new Date().toISOString(),
    confidence: 72,
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

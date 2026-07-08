import { useState, useEffect } from 'react';
import { getWeather, WeatherData } from '../services/weatherService';
import { getSoil, SoilData } from '../services/soilService';
import { getAdminHierarchy, AdminData } from '../services/adminService';
import { getCurrentCrop, CropData } from '../services/cropService';
import { getMarketData, MarketData } from '../services/marketService';
import { getGovernmentSupport, GovernmentData } from '../services/governmentService';

export interface FullLocationData {
  admin: AdminData | null;
  weather: WeatherData | null;
  soil: SoilData | null;
  crop: CropData | null;
  market: MarketData | null;
  government: GovernmentData | null;
  loading: boolean;
  error: string | null;
}

export function useLocationData(lat: number | null, lng: number | null): FullLocationData {
  const [data, setData] = useState<FullLocationData>({
    admin: null, weather: null, soil: null, crop: null, market: null, government: null,
    loading: false, error: null,
  });

  useEffect(() => {
    if (!lat || !lng) return;

    let cancelled = false;
    setData(prev => ({ ...prev, loading: true, error: null }));

    Promise.allSettled([
      getAdminHierarchy(lat, lng),
      getWeather(lat, lng),
      getSoil(lat, lng),
      getCurrentCrop(lat, lng),
      getMarketData(lat, lng),
      getGovernmentSupport(lat, lng),
    ]).then(results => {
      if (cancelled) return;

      const [admin, weather, soil, crop, market, gov] = results;

      setData({
        admin: admin.status === 'fulfilled' ? admin.value : null,
        weather: weather.status === 'fulfilled' ? weather.value : null,
        soil: soil.status === 'fulfilled' ? soil.value : null,
        crop: crop.status === 'fulfilled' ? crop.value : null,
        market: market.status === 'fulfilled' ? market.value : null,
        government: gov.status === 'fulfilled' ? gov.value : null,
        loading: false,
        error: results.some(r => r.status === 'rejected') ? 'Some data sources unavailable' : null,
      });
    });

    return () => { cancelled = true; };
  }, [lat, lng]);

  return data;
}

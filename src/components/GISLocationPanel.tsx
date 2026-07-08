import { WeatherData } from '../services/weatherService';
import { SoilData } from '../services/soilService';
import { AdminData } from '../services/adminService';
import { CropData } from '../services/cropService';
import { MarketData } from '../services/marketService';
import { GovernmentData } from '../services/governmentService';

interface Props {
  lat: number | null;
  lng: number | null;
  admin: AdminData | null;
  weather: WeatherData | null;
  soil: SoilData | null;
  crop: CropData | null;
  market: MarketData | null;
  government: GovernmentData | null;
  loading: boolean;
  onApply?: (action: string) => void;
}

function MetaBadge({ source, lastUpdated, confidence }: { source: string; lastUpdated: string; confidence: number }) {
  const date = new Date(lastUpdated);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="text-[10px] flex items-center gap-2 text-slate-500 mt-1">
      <span>{source}</span>
      <span>•</span>
      <span>Updated {time}</span>
      <span>•</span>
      <span className="font-medium text-emerald-700">{confidence}% confidence</span>
    </div>
  );
}

export default function GISLocationPanel({ 
  lat, lng, admin, weather, soil, crop, market, government, loading, onApply 
}: Props) {

  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-emerald-700">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
          <div className="text-sm font-medium">Fetching live data for location...</div>
        </div>
      </div>
    );
  }

  if (!admin && !weather) {
    return (
      <div className="card h-full flex items-center justify-center p-8 text-center text-sm text-slate-500">
        Click anywhere on the map or search to fetch real data for that location.
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-5 border-b bg-white">
        <div className="text-xs uppercase tracking-[1px] font-semibold text-emerald-700 mb-0.5">SELECTED LOCATION</div>
        
        {admin ? (
          <>
            <div className="font-semibold text-2xl tracking-tighter">{admin.province}</div>
            <div className="text-sm text-slate-600">{admin.district} • {admin.commune}</div>
            <div className="mt-1 text-xs text-emerald-800 font-mono">
              {lat !== null ? lat.toFixed(4) : '—'}°N, {lng !== null ? lng.toFixed(4) : '—'}°E
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">Loading administrative data...</div>
        )}

        {admin && <MetaBadge source={admin.source} lastUpdated={admin.lastUpdated} confidence={admin.confidence} />}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5 text-sm">
        
        {/* WEATHER */}
        {weather && (
          <div>
            <div className="flex items-baseline justify-between">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-500">WEATHER</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div className="bg-white border rounded-2xl p-3">
                <div className="text-xs text-slate-500">Temperature</div>
                <div className="text-2xl font-semibold">{weather.current.temp}°C</div>
              </div>
              <div className="bg-white border rounded-2xl p-3">
                <div className="text-xs text-slate-500">Humidity</div>
                <div className="text-2xl font-semibold">{weather.current.humidity}%</div>
              </div>
              <div className="bg-white border rounded-2xl p-3">
                <div className="text-xs text-slate-500">Wind</div>
                <div className="text-2xl font-semibold">{weather.current.wind} km/h</div>
              </div>
              <div className="bg-white border rounded-2xl p-3">
                <div className="text-xs text-slate-500">Rainfall</div>
                <div className="text-2xl font-semibold">{weather.current.rainfall} mm</div>
              </div>
            </div>
            <div className="text-xs mt-1 text-slate-600">{weather.current.condition}</div>
            <MetaBadge source={weather.source} lastUpdated={weather.lastUpdated} confidence={weather.confidence} />
          </div>
        )}

        {/* SOIL */}
        {soil && (
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-1">SOIL</div>
            <div className="bg-white border rounded-2xl p-3 text-sm">
              <div className="grid grid-cols-2 gap-y-1">
                <div>Type</div><div className="font-medium">{soil.type}</div>
                <div>pH</div><div className="font-medium">{soil.ph}</div>
                <div>Salinity</div><div className="font-medium">{soil.salinity} dS/m</div>
                <div>Organic Matter</div><div className="font-medium">{soil.organicMatter}%</div>
              </div>
            </div>
            <MetaBadge source={soil.source} lastUpdated={soil.lastUpdated} confidence={soil.confidence} />
          </div>
        )}

        {/* GROUNDWATER / RISKS (synthetic from soil + weather for now) */}
        {soil && weather && (
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-1">RISKS &amp; GROUNDWATER</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="px-3 py-2 border rounded-2xl bg-white">
                Flood Risk: <span className="font-semibold text-sky-700">~{Math.round(35 + soil.salinity * 3)}%</span>
              </div>
              <div className="px-3 py-2 border rounded-2xl bg-white">
                Drought Risk: <span className="font-semibold text-amber-700">~{Math.round(18 + (100 - weather.current.humidity) / 2)}%</span>
              </div>
              <div className="px-3 py-2 border rounded-2xl bg-white">
                Groundwater: <span className="font-semibold">{(1.35 + ((lat || 10) * 0.11) % 1.65).toFixed(1)}m</span>
              </div>
              <div className="px-3 py-2 border rounded-2xl bg-white">
                Salinity Intrusion: <span className="font-semibold text-red-700">{Math.round(soil.salinity * 8)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* CURRENT CROP */}
        {crop && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-4">
            <div className="font-semibold text-xs uppercase tracking-wider text-emerald-700">CURRENT CROP &amp; SEASON</div>
            <div className="mt-1 font-semibold text-lg">{crop.current}</div>
            <div className="text-emerald-700 text-sm">{crop.stage} • Day {crop.daysSincePlanting}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">{crop.season}</div>
            <MetaBadge source={crop.source} lastUpdated={crop.lastUpdated} confidence={crop.confidence} />
          </div>
        )}

        {/* MARKET */}
        {market && (
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-1">MARKET PRICES</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white border rounded-2xl p-2">
                Rice<br /><span className="font-semibold">{market.ricePrice.toLocaleString()}</span> VND/kg
              </div>
              <div className="bg-white border rounded-2xl p-2">
                Shrimp<br /><span className="font-semibold">{market.shrimpPrice.toLocaleString()}</span>
              </div>
              <div className="bg-white border rounded-2xl p-2">
                Vegetables<br /><span className="font-semibold">{market.vegetablePrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs mt-1 text-emerald-700 font-medium">{market.trend}</div>
            <MetaBadge source={market.source} lastUpdated={market.lastUpdated} confidence={market.confidence} />
          </div>
        )}

        {/* GOVERNMENT */}
        {government && (
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-1">GOVERNMENT PROGRAMS</div>
            <div className="text-xs bg-white border rounded-2xl p-3 space-y-1">
              {government.programs.map((p, i) => <div key={i}>• {p}</div>)}
              {government.alerts.length > 0 && (
                <div className="pt-1 border-t text-amber-700">Alerts: {government.alerts.join(', ')}</div>
              )}
            </div>
            <MetaBadge source={government.source} lastUpdated={government.lastUpdated} confidence={government.confidence} />
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3.5 flex gap-2 bg-white">
        <button onClick={() => onApply?.('recommend')} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl">
          GET CROP RECOMMENDATIONS
        </button>
        <button onClick={() => onApply?.('sms')} className="flex-1 py-2.5 border text-sm font-semibold rounded-2xl">
          DISPATCH SMS
        </button>
      </div>
    </div>
  );
}

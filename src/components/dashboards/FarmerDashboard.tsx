import { useState } from 'react';
import { useLocationData } from '../../hooks/useLocationData';
import { generateRecommendations } from '../../services/decisionEngine';
import { MetricCard, RecCard, DataBadge } from './shared';
import { generateAnalysis } from '../../data/analysisGenerator';

export default function FarmerDashboard() {
  // Use a default Mekong location for demo
  const [selected, setSelected] = useState({ lat: 10.52, lng: 105.13 });
  const data = useLocationData(selected.lat, selected.lng);

  const recommendations = data.admin && data.soil && data.weather
    ? generateRecommendations({
        lat: selected.lat,
        lng: selected.lng,
        admin: data.admin,
        weather: data.weather,
        soil: data.soil,
        crop: data.crop,
        market: data.market,
        government: data.government,
        groundwater: { depth: 1.8 },
      })
    : [];

  const analysis = generateAnalysis(selected.lat, selected.lng);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between mb-6">
        <div>
          <div className="role-badge farmer">FARMER</div>
          <div className="text-3xl font-semibold tracking-tighter mt-1">Nguyen Van Minh • Chau Doc</div>
        </div>
        <button onClick={() => setSelected({ lat: 9.6 + ((Date.now() % 13) * 0.085), lng: 105.1 + ((Date.now() % 19) * 0.08) })} className="text-sm px-4 py-2 border rounded-2xl">Change Field</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Current Salinity" value={analysis.soil.salinity} unit="dS/m" />
        <MetricCard label="Expected Yield" value={recommendations[0]?.expectedYield || 6.1} unit="t/ha" trend="+0.9 vs last season" />
        <MetricCard label="Projected Profit" value={recommendations[0]?.expectedProfit || 42} unit="M VND" />
      </div>

      {/* Weather + SMS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card p-5">
          <div className="font-semibold mb-3">Today’s Weather</div>
          {data.weather ? (
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>{data.weather.current.temp}°C</div>
              <div>{data.weather.current.humidity}% humidity</div>
              <div>{data.weather.current.wind} km/h wind</div>
              <div>{data.weather.current.condition}</div>
            </div>
          ) : <div className="text-sm text-slate-500">Loading weather...</div>}
          <DataBadge source="Open-Meteo" confidence={data.weather?.confidence} />
        </div>

        <div className="lg:col-span-2 card p-5">
          <div className="font-semibold mb-3">Latest SMS Alert</div>
          <div className="bg-slate-900 text-emerald-200 text-sm p-3 rounded-2xl">
            ALERT: Salinity 6.8 dS/m. Switch to ST25 + AWD. Expected +0.9 t/ha. Reply CONFIRM.
          </div>
          <button className="mt-3 w-full text-xs py-2 bg-emerald-700 text-white rounded-2xl">SEND TO MY PHONE</button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6">
        <div className="font-semibold mb-3">Your Top Recommendations</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.slice(0, 2).map((rec, i) => <RecCard key={i} rec={rec} />)}
        </div>
      </div>
    </div>
  );
}

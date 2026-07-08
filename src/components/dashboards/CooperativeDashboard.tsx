import { MetricCard, RecCard, DataBadge } from './shared';
import { useLocationData } from '../../hooks/useLocationData';
import { generateRecommendations } from '../../services/decisionEngine';

export default function CooperativeDashboard() {
  const [lat, lng] = [10.0, 105.15]; // Kien Giang area
  const data = useLocationData(lat, lng);

  const recs = data.soil && data.weather && data.market
    ? generateRecommendations({
        lat, lng, admin: data.admin, weather: data.weather, soil: data.soil,
        crop: data.crop, market: data.market, government: data.government, groundwater: { depth: 1.9 }
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="role-badge cooperative">AGRICULTURAL COOPERATIVE</div>
        <div className="text-3xl font-semibold tracking-tighter">Kien Giang Rice Cooperative</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Area Managed" value="18,700" unit="ha" />
        <MetricCard label="Active Members" value="12,480" />
        <MetricCard label="Avg Yield (this season)" value="5.4" unit="t/ha" trend="+11%" />
        <MetricCard label="Water Savings (AWD)" value="34" unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Cooperative-wide Recommendations</div>
          <div className="space-y-3">
            {recs.slice(0, 2).map((r, i) => <RecCard key={i} rec={r} />)}
          </div>
          <DataBadge source="Decision Engine" />
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-3">Demand &amp; Storage</div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Current rice demand</span><span className="font-medium">14,200 tons</span></div>
            <div className="flex justify-between"><span>Storage capacity</span><span className="font-medium">9,800 tons (68% full)</span></div>
            <div className="flex justify-between"><span>Next harvest window</span><span className="font-medium">Aug 12 – Sep 3</span></div>
          </div>
          <button className="mt-4 w-full text-sm py-2 bg-blue-700 text-white rounded-2xl">Plan Harvest Logistics</button>
        </div>
      </div>
    </div>
  );
}

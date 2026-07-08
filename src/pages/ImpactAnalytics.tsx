import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { provinces } from '../data/mockData';

const yieldData = provinces.map(p => ({
  name: p.name.split(' ')[0],
  yield: parseFloat((4.6 + (p.ndviAvg - 0.5) * 4.4).toFixed(1)),
  risk: p.salinityRisk,
}));

const economicImpact = [
  { month: 'Mar', value: 142 }, { month: 'Apr', value: 187 }, { month: 'May', value: 201 },
  { month: 'Jun', value: 269 }, { month: 'Jul', value: 311 },
];

// Note: adoption and COLORS removed (unused in current demonstration-only UI)

export default function ImpactAnalytics() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-2 px-1">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-900 text-red-100 text-xs font-bold tracking-wider">
          ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ DEMONSTRATION DATA ONLY — NOT REAL RESULTS — FOR HACKATHON EVALUATION ONLY
        </div>
      </div>

      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="font-semibold text-4xl tracking-tighter">Impact Analytics</div>
          <div className="text-xl text-slate-500">Modeled capacity if recommendations adopted at scale (demonstration)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {[
          { label: "Modeled Economic Impact", value: "₫243M", sub: "26 districts • 10% conservative adoption" },
          { label: "Potential Water Savings", value: "38M m³", sub: "AWD on modeled area (est.)" },
          { label: "Yield Lift Potential", value: "+0.9 t/ha", sub: "ST25 vs baseline (model avg)" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="text-[39px] font-semibold tracking-tighter mt-1">{s.value}</div>
            <div className="text-emerald-600 text-xs mt-px">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="font-semibold mb-4">Yield vs Salinity Risk by Province (Modeled)</div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="yield" fill="#22C55E" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="font-semibold mb-4">Cumulative Modeled Economic Impact (VND billions)</div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={economicImpact}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="natural" dataKey="value" stroke="#14532D" strokeWidth={3} dot={{ fill: '#14532D', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-red-700 font-medium px-1">
        PROOF LOOP (DEMO ONLY): Province reference patterns → rule-based recommendations → modeled economic/water outcomes. All values are conservative demonstration estimates. Real deployment requires live sensor validation.
      </div>
    </div>
  );
}

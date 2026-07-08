// PROOF LOOP (DEMO): Inputs from map → decisionEngine → full transparent economic comparison with charts. All numbers use labeled demonstration data.
// DEMONSTRATION: All economic calculations use transparent formulas on labeled demo inputs.
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { calculateEconomicComparison } from '../services/economicService';
import { DecisionInput } from '../types/recommendation';
import { CropRecommendation } from '../types/recommendation';
import { EconomicComparison } from '../types/economic';

interface Props {
  lat: number | null;
  lng: number | null;
  currentCrop: any;
  recommended: CropRecommendation | null;
  input: DecisionInput | null;
}

export default function EconomicDecision({ lat, lng, currentCrop, recommended, input }: Props) {
  const comparison: EconomicComparison | null = useMemo(() => {
    if (!lat || !lng || !input || !recommended) return null;
    return calculateEconomicComparison(input, currentCrop, recommended);
  }, [lat, lng, currentCrop, recommended, input]);

  if (!comparison) {
    return (
      <div className="card p-6 text-sm text-slate-500">
        Select a location and generate recommendations to see the Economic Comparison.
      </div>
    );
  }

  const { current, recommended: rec, comparison: comp, market, subsidy, nearestCooperative, assumptions } = comparison;

  // Chart data
  const chartData = [
    {
      name: 'Revenue',
      Current: current.revenue,
      Recommended: rec.revenue,
    },
    {
      name: 'Cost',
      Current: current.cost,
      Recommended: rec.cost,
    },
    {
      name: 'Profit',
      Current: current.profit,
      Recommended: rec.profit,
    },
  ];

  // Cost breakdown pie (for recommended)
  const costBreakdown = [
    { name: 'Variable Costs', value: Math.round(rec.cost * 0.68) },
    { name: 'Fixed Costs', value: Math.round(rec.cost * 0.32) },
  ];
  const COLORS = ['#14532D', '#64748B'];

  // Payback projection (simple 5-season model)
  const paybackProjection = Array.from({ length: 5 }, (_, i) => ({
    season: `S${i + 1}`,
    cumulativeProfit: Math.round((rec.profit - current.profit) * (i + 1) - comp.investment),
  }));

  const profitDeltaColor = comp.profitIncrease > 0 ? 'text-emerald-700' : 'text-red-600';

  // Key live inputs used for this calculation (full transparency)
  const usedInputs = [
    `Salinity: ${input?.soil?.salinity?.toFixed(1) ?? '—'} dS/m`,
    `Rainfall: ${input?.weather?.current?.rainfall ?? '—'} mm`,
    `Rice price: ${input?.market?.ricePrice?.toLocaleString() ?? '—'} VND/kg`,
    `Current crop: ${current.crop}`,
  ];

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg tracking-tight">Economic Decision Module</div>
            <div className="text-xs text-emerald-700">
              {current.crop} vs {rec.crop} • {lat?.toFixed(2)}°N, {lng?.toFixed(2)}°E
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-semibold tracking-tighter ${profitDeltaColor}`}>
              +{comp.profitIncrease} M VND/ha
            </div>
            <div className="text-[10px] text-emerald-700">Net Profit Uplift</div>
          </div>
        </div>
      </div>

      {/* Key Comparison Metrics */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white border rounded-2xl p-3">
          <div className="text-xs text-slate-500">Profit Increase</div>
          <div className={`text-2xl font-semibold tracking-tighter ${profitDeltaColor}`}>
            +{comp.profitIncrease} M VND
          </div>
          <div className="text-xs">+{comp.profitIncreasePercent}%</div>
        </div>
        <div className="bg-white border rounded-2xl p-3">
          <div className="text-xs text-slate-500">Investment Required</div>
          <div className="text-2xl font-semibold tracking-tighter">{comp.investment} M VND</div>
        </div>
        <div className="bg-white border rounded-2xl p-3">
          <div className="text-xs text-slate-500">Payback Period</div>
          <div className="text-2xl font-semibold tracking-tighter">{comp.paybackSeasons} seasons</div>
          <div className="text-xs">≈ {comp.paybackMonths} months</div>
        </div>
        <div className="bg-white border rounded-2xl p-3">
          <div className="text-xs text-slate-500">Government Subsidy</div>
          <div className="text-xl font-semibold tracking-tighter">
            {subsidy.eligible ? `+${subsidy.amount}M` : 'None'}
          </div>
          <div className="text-xs">{subsidy.description}</div>
        </div>
      </div>

      {/* Detailed Side-by-Side Comparison */}
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current */}
        <div className="border rounded-2xl p-4">
          <div className="font-semibold mb-2 text-sm">CURRENT CROP: {current.crop}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Yield</span><span className="font-medium">{current.yield} t/ha</span></div>
            <div className="flex justify-between"><span>Revenue</span><span className="font-medium">{current.revenue} M VND/ha</span></div>
            <div className="flex justify-between"><span>Cost</span><span className="font-medium">{current.cost} M VND/ha</span></div>
            <div className="flex justify-between border-t pt-1 font-semibold"><span>Profit</span><span>{current.profit} M VND/ha</span></div>
          </div>
        </div>

        {/* Recommended */}
        <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-4">
          <div className="font-semibold mb-2 text-sm text-emerald-800">RECOMMENDED: {rec.crop}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Yield</span><span className="font-medium">{rec.yield} t/ha</span></div>
            <div className="flex justify-between"><span>Revenue</span><span className="font-medium">{rec.revenue} M VND/ha</span></div>
            <div className="flex justify-between"><span>Cost</span><span className="font-medium">{rec.cost} M VND/ha</span></div>
            <div className="flex justify-between border-t pt-1 font-semibold text-emerald-700"><span>Profit</span><span>{rec.profit} M VND/ha</span></div>
          </div>

          {/* Trust signals for the recommended crop */}
          {recommended && (
            <div className="mt-3 pt-2 border-t border-emerald-200 text-xs text-emerald-800">
              <div className="flex justify-between">
                <span>Confidence: <strong>{recommended.confidence}%</strong></span>
                {recommended.uncertainty != null && <span>Uncertainty: ±{recommended.uncertainty}%</span>}
              </div>
              {recommended.lastUpdated && (
                <div className="mt-0.5">Last updated: {new Date(recommended.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              )}
              {recommended.confidence < 70 && (
                <div className="mt-1 text-amber-700 font-medium">⚠ Moderate confidence — verify locally before major changes.</div>
              )}
              {recommended.expectedBenefit && (
                <div className="mt-1">{recommended.expectedBenefit}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Main comparison bar chart */}
        <div className="lg:col-span-3">
          <div className="font-semibold text-sm mb-2">Revenue • Cost • Profit (M VND / ha)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Current" fill="#64748B" radius={4} />
                <Bar dataKey="Recommended" fill="#14532D" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost breakdown pie */}
        <div className="lg:col-span-2">
          <div className="font-semibold text-sm mb-2">Recommended Crop Cost Breakdown</div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {costBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payback Projection Chart */}
      <div className="px-5 pb-5">
        <div className="font-semibold text-sm mb-2">Cumulative Profit Advantage (Recommended vs Current) — Payback Projection</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paybackProjection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cumulativeProfit" 
                stroke="#14532D" 
                strokeWidth={3} 
                dot={{ fill: '#14532D', r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Break-even when the line crosses 0. Current payback: {comp.paybackSeasons} seasons.
        </div>
      </div>

      {/* Additional Context */}
      <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded-2xl p-3">
          <div className="text-xs text-slate-500 mb-1">Market &amp; Demand</div>
          <div>{market.demand}</div>
          <div className="text-xs mt-1">{market.seasonalTrend} • {market.priceTrend}</div>
        </div>

        <div className="border rounded-2xl p-3">
          <div className="text-xs text-slate-500 mb-1">Government Support</div>
          <div>{subsidy.description}</div>
          {subsidy.eligible && <div className="text-emerald-700 text-xs mt-1">+{subsidy.amount}M VND/ha available</div>}
        </div>

        <div className="border rounded-2xl p-3">
          <div className="text-xs text-slate-500 mb-1">Nearest Cooperative</div>
          <div className="font-medium">{nearestCooperative.name}</div>
          <div className="text-xs">{nearestCooperative.distance} km • {nearestCooperative.members} members</div>
        </div>
      </div>

      {/* Transparent Assumptions + Calculation Details + Live Inputs */}
      <div className="bg-slate-50 border-t px-5 py-4 text-xs">
        <div className="font-semibold mb-1 text-slate-600">ASSUMPTIONS &amp; METHODOLOGY (FULLY TRANSPARENT)</div>
        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
          {assumptions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        
        <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div>
            <strong>Formulas:</strong><br />
            Revenue = Yield × Price/ton × Market factor<br />
            Profit = Revenue − (Variable + Fixed costs)<br />
            Profit Increase = Recommended Profit − Current Profit<br />
            Payback Seasons = Investment ÷ (Profit Delta)
          </div>
          <div>
            <strong>Live data used for this calculation:</strong><br />
            {usedInputs.map((u, i) => <span key={i}>{u} &nbsp;</span>)}
          </div>
        </div>

        <div className="mt-2 text-[10px] text-slate-500">
          Last calculated: {new Date(comparison.lastUpdated).toLocaleTimeString()} • Dynamically recomputed on every location change
        </div>
      </div>
    </div>
  );
}

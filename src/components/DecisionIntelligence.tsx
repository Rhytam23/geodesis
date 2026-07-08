import { useState } from 'react';
import { CropRecommendation } from '../types/recommendation';
import { RecommendationsSkeleton } from './shared/LoadingStates';

interface Props {
  recommendations: CropRecommendation[];
  locationName: string;
  loading?: boolean;
}

export default function DecisionIntelligence({ recommendations, locationName, loading }: Props) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleWhy = (index: number) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <RecommendationsSkeleton />;

  if (!recommendations.length) {
    return (
      <div className="card p-6">
        <div className="bg-red-900 text-red-100 text-xs px-3 py-1.5 rounded mb-3 font-medium">
          PROOF LOOP (DEMO ONLY): All outputs are from transparent rule-based engine using labeled demo data.
        </div>
        Select a location on the map to generate recommendations.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="bg-red-900 text-red-100 px-4 py-1.5 text-xs font-medium">
        PROOF LOOP (DEMO ONLY) — Transparent rule-based decisionEngine.ts • Labeled demonstration data only
      </div>

      <div className="px-5 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <div className="font-semibold text-lg tracking-tight">Decision Intelligence</div>
          <div className="text-xs text-emerald-700">Analysis for {locationName}</div>
        </div>
        <div className="text-[10px] px-3 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">RULE-BASED • FULLY EXPLAINABLE</div>
      </div>

      <div className="p-4 space-y-3 bg-white">
        {recommendations.map((rec, index) => {
          const isExpanded = !!expanded[index];
          return (
            <div key={index} className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-200 transition">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg tracking-tight">{rec.crop}</div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-px text-xs font-bold rounded-full ${rec.confidence > 85 ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'}`}>
                    {rec.confidence}% CONFIDENCE
                  </div>
                  <div className={`text-xs px-2.5 py-px rounded-full border font-medium ${
                    rec.riskLevel === 'Low' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-amber-300 text-amber-700 bg-amber-50'
                  }`}>
                    {rec.riskLevel} RISK
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-3 text-sm">
                <div><div className="text-xs text-slate-500">Expected Yield</div><div className="font-semibold text-xl">{rec.expectedYield} t/ha</div></div>
                <div><div className="text-xs text-slate-500">Profit</div><div className="font-semibold text-xl">{rec.expectedProfit} M VND</div></div>
                <div><div className="text-xs text-slate-500">Water</div><div className="font-semibold text-xl">{rec.waterRequirement.toLocaleString()} m³/ha</div></div>
                <div><div className="text-xs text-slate-500">Risk</div><div className="font-semibold">{rec.riskLevel}</div></div>
              </div>

              <div className="mt-4">
                <div className="uppercase text-xs tracking-wider font-semibold text-emerald-700 mb-1.5">REASONING</div>
                <ul className="text-sm space-y-1 pl-1 text-slate-700">
                  {rec.reasoning.slice(0, 3).map((r, i) => <li key={i} className="flex gap-2">→ {r}</li>)}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs">
                <div className="text-emerald-700 font-medium">Source: {rec.supportingDatasets?.[0] || 'Labeled demo data'}</div>
                <button onClick={() => toggleWhy(index)} className="text-emerald-700 font-semibold">
                  {isExpanded ? 'HIDE DETAILS' : 'SHOW WHY + MATH'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t text-xs bg-emerald-50 p-3 rounded-xl">
                  <div>Exact formula: {rec.calculationFormula}</div>
                  <div className="mt-2 text-emerald-700">All values are from the transparent rule-based engine on demonstration data.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

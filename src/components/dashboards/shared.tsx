import { CropRecommendation } from '../../types/recommendation';

// Reusable Metric Card
export function MetricCard({ label, value, unit, trend }: { label: string; value: string | number; unit?: string; trend?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold tracking-tighter mt-0.5">
        {value} <span className="text-base font-normal text-slate-500">{unit}</span>
      </div>
      {trend && <div className="text-xs text-emerald-600 mt-0.5">{trend}</div>}
    </div>
  );
}

// Reusable Recommendation Mini Card — now with full trust signals
export function RecCard({ rec }: { rec: CropRecommendation }) {
  const whySnippet = rec.weatherInfluence 
    ? `${rec.weatherInfluence.explanation.slice(0, 58)}...` 
    : (rec.reasoning?.[0] || '');
  
  const isLowConfidence = rec.confidence < 70;

  return (
    <div className="border rounded-2xl p-4 text-sm">
      <div className="flex justify-between">
        <div className="font-semibold">{rec.crop}</div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${rec.confidence > 85 ? 'bg-emerald-700 text-white' : isLowConfidence ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {rec.confidence}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div>Yield: <span className="font-medium">{rec.expectedYield} t/ha</span></div>
        <div>Profit: <span className="font-medium">{rec.expectedProfit}M</span></div>
        <div>Risk: <span className="font-medium">{rec.riskLevel}</span></div>
      </div>

      {/* Trust line */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
        {rec.lastUpdated && <span>Updated {new Date(rec.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>}
        {rec.uncertainty != null && <span>±{rec.uncertainty}% uncertainty</span>}
        {isLowConfidence && <span className="text-amber-600 font-medium">⚠ Moderate confidence</span>}
      </div>

      {/* Transparent "why" teaser */}
      {whySnippet && (
        <div className="mt-1.5 text-[10px] text-emerald-700 border-t pt-1.5 leading-tight">
          Why: {whySnippet}
        </div>
      )}

      {rec.supportingDatasets && rec.supportingDatasets.length > 0 && (
        <div className="mt-1 text-[9px] text-slate-500">Sources: {rec.supportingDatasets.slice(0,2).join(' • ')}</div>
      )}

      {rec.expectedBenefit && (
        <div className="mt-1 text-[9px] text-emerald-600 font-medium">{rec.expectedBenefit}</div>
      )}
    </div>
  );
}

// Data source badge
export function DataBadge({ source, confidence }: { source: string; confidence?: number }) {
  return (
    <div className="text-[10px] inline-flex items-center gap-1 px-2 py-px bg-slate-100 rounded text-slate-600">
      {source} {confidence && `• ${confidence}%`}
    </div>
  );
}

import { CropRecommendation } from '../../types/recommendation';

interface Props {
  rec: CropRecommendation;
  compact?: boolean;
}

export default function RecommendationCard({ rec, compact = false }: Props) {
  const why = rec.weatherInfluence?.explanation || rec.reasoning?.[0] || '';

  return (
    <div className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-200 transition-all">
      <div className="flex justify-between items-start">
        <div className="font-semibold text-lg tracking-tight">{rec.crop}</div>
        <div className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${rec.confidence > 85 ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'}`}>
          {rec.confidence}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
        <div>
          <div className="text-[10px] text-slate-500">Yield</div>
          <div className="font-semibold">{rec.expectedYield} t/ha</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Profit</div>
          <div className="font-semibold">{rec.expectedProfit}M VND</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Risk</div>
          <div className="font-medium">{rec.riskLevel}</div>
        </div>
      </div>

      {!compact && why && (
        <div className="mt-3 text-xs text-emerald-700 border-t pt-2 leading-tight">
          {why.length > 110 ? why.slice(0, 108) + '…' : why}
        </div>
      )}

      {rec.supportingDatasets && rec.supportingDatasets.length > 0 && (
        <div className="mt-2 text-[10px] text-slate-500">
          {rec.supportingDatasets.slice(0, 2).join(' • ')}
        </div>
      )}
    </div>
  );
}

export const LocationPanelSkeleton = () => (
  <div className="card p-6 animate-pulse space-y-4">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="space-y-2">
      {Array.from({length: 4}).map((_,i) => <div key={i} className="h-3 bg-slate-100 rounded" />)}
    </div>
    <div className="h-20 bg-slate-100 rounded"></div>
  </div>
);

export const RecommendationsSkeleton = () => (
  <div className="card p-6 animate-pulse space-y-3">
    {Array.from({length: 3}).map((_,i) => (
      <div key={i} className="border rounded-2xl p-4">
        <div className="h-4 bg-slate-200 w-1/3 mb-3 rounded"></div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({length:4}).map((_,j) => <div key={j} className="h-8 bg-slate-100 rounded" />)}
        </div>
      </div>
    ))}
  </div>
);

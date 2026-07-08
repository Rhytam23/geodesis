

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-slate-200 rounded ${className}`} 
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Skeleton className="h-6" />
        <Skeleton className="h-6" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-100 flex items-center justify-center h-full min-h-[420px]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <div className="text-sm text-slate-500">Loading professional GIS map...</div>
      </div>
    </div>
  );
}

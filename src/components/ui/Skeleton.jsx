export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex items-center justify-between gap-4 pb-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 flex gap-4 items-center">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={`h-4 ${colIndex === 0 ? "w-1/3" : "flex-1"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** KPI card skeleton — 4 cards in a row */
export function KpiCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Single card content skeleton */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? "w-1/2" : i === lines - 1 ? "w-1/3" : "w-full"}`} />
      ))}
    </div>
  );
}

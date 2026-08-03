export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/50 ${className}`}
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

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-8 w-24 rounded-full" />
        <div className="skeleton h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="skeleton h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="skeleton h-4 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded" />
    </div>
  );
}

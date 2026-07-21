export default function DeliveryLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
      </div>
      {/* Status toggle */}
      <div className="h-12 w-40 animate-pulse rounded-xl bg-emerald-100" />
      {/* Orders list */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-emerald-50" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-emerald-100" />
              <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-xl bg-emerald-50" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-3xl border border-emerald-50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-emerald-50">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="divide-y divide-emerald-50/50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 px-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

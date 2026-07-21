export default function CartLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 z-50 w-full h-16 border-b border-emerald-50 bg-background/80 backdrop-blur-md" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="h-9 w-32 animate-pulse rounded-xl bg-muted" />
        {/* Cart items skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-emerald-50 bg-white p-4 shadow-xs">
              <div className="h-20 w-20 animate-pulse rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded bg-emerald-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-5 w-8 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
        {/* Summary skeleton */}
        <div className="rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="flex justify-between"><div className="h-4 w-20 animate-pulse rounded bg-muted" /><div className="h-4 w-16 animate-pulse rounded bg-muted" /></div>
            <div className="flex justify-between"><div className="h-4 w-24 animate-pulse rounded bg-muted" /><div className="h-4 w-16 animate-pulse rounded bg-muted" /></div>
          </div>
          <div className="h-12 w-full animate-pulse rounded-xl bg-emerald-100" />
        </div>
      </main>
    </div>
  );
}

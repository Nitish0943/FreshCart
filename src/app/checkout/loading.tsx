export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 z-50 w-full h-16 border-b border-emerald-50 bg-background/80 backdrop-blur-md" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="h-9 w-36 animate-pulse rounded-xl bg-muted" />
        {/* Address section */}
        <div className="rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>
        {/* Payment section */}
        <div className="rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>
        {/* Summary */}
        <div className="rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full animate-pulse rounded-xl bg-emerald-100" />
        </div>
      </main>
    </div>
  );
}

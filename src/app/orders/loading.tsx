export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 z-50 w-full h-16 border-b border-emerald-50 bg-background/80 backdrop-blur-md" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="h-9 w-36 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-emerald-50 bg-white p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-emerald-50" />
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1.5">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

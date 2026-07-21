export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-emerald-50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-emerald-100" />
          <div className="hidden md:flex space-x-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-12">
        {/* Hero skeleton */}
        <div className="h-[360px] md:h-[400px] animate-pulse rounded-3xl bg-gradient-to-r from-emerald-100 to-emerald-50" />

        {/* Categories skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2 flex flex-col items-center">
                <div className="w-full aspect-square animate-pulse rounded-2xl bg-emerald-50" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Products skeleton */}
        <div className="space-y-6">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-emerald-50/20 p-3 shadow-xs">
                <div className="aspect-square animate-pulse rounded-xl bg-slate-100 mb-3" />
                <div className="space-y-2 px-1">
                  <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-16 animate-pulse rounded bg-emerald-100" />
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-emerald-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

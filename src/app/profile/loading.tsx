export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 z-50 w-full h-16 border-b border-emerald-50 bg-background/80 backdrop-blur-md" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="h-9 w-32 animate-pulse rounded-xl bg-muted" />
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-emerald-100" />
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-52 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {/* Form fields */}
        <div className="rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-50" />
            </div>
          ))}
          <div className="h-11 w-full animate-pulse rounded-xl bg-emerald-100" />
        </div>
      </main>
    </div>
  );
}

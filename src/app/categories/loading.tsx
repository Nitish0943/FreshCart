export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 z-50 w-full h-16 border-b border-emerald-50 bg-background/80 backdrop-blur-md" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-full aspect-square animate-pulse rounded-2xl bg-emerald-50" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

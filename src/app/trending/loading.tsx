export default function TrendingLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}

      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="h-12 w-96 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-80 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Skills Grid Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-64 bg-white/5 rounded mb-2 animate-pulse" />
            <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-9 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 border border-white/5 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
              <div className="h-16 bg-white/5 rounded mb-4" />
              <div className="h-10 bg-white/5 rounded mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <div className="h-5 w-16 bg-white/5 rounded" />
                  <div className="h-5 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-4 w-16 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

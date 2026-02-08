export default function StatsLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}

      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="h-12 w-80 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Overview Stats Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 border border-white/5 rounded-lg p-6 animate-pulse"
            >
              <div className="h-10 w-20 bg-white/5 rounded mb-2" />
              <div className="h-4 w-32 bg-white/5 rounded mb-4" />
              <div className="h-4 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Top Tags Section Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-white/5 rounded mb-6 animate-pulse" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 border border-white/5 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/5 rounded" />
                  <div>
                    <div className="h-5 w-24 bg-white/5 rounded mb-1" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-6 w-12 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tag Cloud Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-white/5 rounded mb-6 animate-pulse" />
        <div className="bg-card/50 border border-white/5 rounded-lg p-8 animate-pulse">
          <div className="flex flex-wrap gap-3 justify-center">
            {[85, 120, 95, 110, 75, 130, 90, 105, 125, 80, 115, 100, 70, 135, 95, 120, 85, 110, 100, 90].map((width, i) => (
              <div
                key={i}
                className="h-6 bg-white/5 rounded"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Additions Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-8 w-56 bg-white/5 rounded mb-6 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 border border-white/5 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
              <div className="h-12 bg-white/5 rounded mb-4" />
              <div className="flex gap-1">
                <div className="h-5 w-16 bg-white/5 rounded" />
                <div className="h-5 w-20 bg-white/5 rounded" />
                <div className="h-5 w-14 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

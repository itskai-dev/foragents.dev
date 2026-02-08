export default function CreatorsLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}

      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="h-10 w-80 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Creators List Skeleton */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-card/50 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="h-7 w-48 bg-white/5 rounded mb-4" />
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="h-5 w-24 bg-white/5 rounded" />
                    <div className="h-5 w-32 bg-white/5 rounded" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <div className="h-6 w-20 bg-white/5 rounded" />
                    <div className="h-6 w-24 bg-white/5 rounded" />
                    <div className="h-6 w-16 bg-white/5 rounded" />
                    <div className="h-6 w-28 bg-white/5 rounded" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="h-16 bg-white/5 rounded" />
                    <div className="h-16 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

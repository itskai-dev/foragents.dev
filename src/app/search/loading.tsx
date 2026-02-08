export default function SearchLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-10 w-64 bg-white/5 rounded mb-2 animate-pulse" />
        <div className="h-5 w-96 bg-white/5 rounded mb-8 animate-pulse" />

        {/* Search Input Skeleton */}
        <div className="relative mb-8">
          <div className="w-full h-12 bg-card border border-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Initial State Skeleton */}
        <div className="text-center py-12">
          <div className="h-12 w-12 bg-white/5 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-48 bg-white/5 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

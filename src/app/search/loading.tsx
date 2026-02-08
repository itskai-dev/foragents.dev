export default function SearchLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}

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

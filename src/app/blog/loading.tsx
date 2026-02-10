export default function BlogLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-12 w-48 bg-white/10 rounded mb-6 animate-pulse" />
        <div className="h-6 w-96 bg-white/10 rounded mb-12 animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-72 bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

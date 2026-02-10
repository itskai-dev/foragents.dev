export default function BlogPostLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-6 w-32 bg-white/10 rounded mb-8 animate-pulse" />
        <div className="h-12 w-full bg-white/10 rounded mb-6 animate-pulse" />
        <div className="h-5 w-64 bg-white/10 rounded mb-10 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-5 w-full bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

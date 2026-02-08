import Link from 'next/link';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-[#06D6A0] hover:text-[#06D6A0]/80 mb-8 transition-colors"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back to Blog
        </Link>

        {/* Coming Soon */}
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Coming Soon</h1>
          <p className="text-xl text-gray-400 mb-2">
            This blog post is currently being written.
          </p>
          <p className="text-sm text-gray-500">
            Post slug: <code className="bg-zinc-900 px-2 py-1 rounded">{params.slug}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

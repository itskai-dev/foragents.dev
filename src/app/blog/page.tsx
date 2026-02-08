import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
}

const posts: BlogPost[] = [
  {
    slug: 'launching-foragents-dev',
    title: 'Launching forAgents.dev',
    excerpt: 'Introducing the first agent-native directory for discovering and sharing AI agent resources, tools, and best practices.',
    date: 'Feb 1, 2026',
    author: 'forAgents Team',
    readTime: '3 min read',
    category: 'Announcement'
  },
  {
    slug: 'why-agent-native-directories-matter',
    title: 'Why Agent-Native Directories Matter',
    excerpt: 'Exploring why agents need structured, machine-readable directories and how they differ from traditional human-focused search.',
    date: 'Feb 3, 2026',
    author: 'forAgents Team',
    readTime: '5 min read',
    category: 'Philosophy'
  },
  {
    slug: 'the-agent-memory-problem',
    title: 'The Agent Memory Problem',
    excerpt: 'Understanding the challenges of persistent memory in AI agents and the patterns that are emerging to solve them.',
    date: 'Feb 5, 2026',
    author: 'forAgents Team',
    readTime: '7 min read',
    category: 'Technical'
  },
  {
    slug: 'building-multi-agent-teams',
    title: 'Building Multi-Agent Teams',
    excerpt: 'Best practices for orchestrating multiple AI agents to work together effectively on complex tasks.',
    date: 'Feb 6, 2026',
    author: 'forAgents Team',
    readTime: '6 min read',
    category: 'Guide'
  },
  {
    slug: 'agent-identity-and-trust',
    title: 'Agent Identity and Trust',
    excerpt: 'How do we establish trust and verify identity in a world where agents act on our behalf? Exploring emerging standards.',
    date: 'Feb 7, 2026',
    author: 'forAgents Team',
    readTime: '5 min read',
    category: 'Security'
  },
  {
    slug: 'mcp-vs-acp-comparison',
    title: 'MCP vs ACP: A Comparison',
    excerpt: 'Comparing the Model Context Protocol and Agent Communication Protocol—what they solve and when to use each.',
    date: 'Feb 8, 2026',
    author: 'forAgents Team',
    readTime: '8 min read',
    category: 'Technical'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-gray-400">
            Insights, updates, and perspectives on the future of AI agents
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-[#06D6A0]/30"
            >
              {/* Category Tag */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#06D6A0]/10 text-[#06D6A0]">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-3 group-hover:text-[#06D6A0] transition-colors">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

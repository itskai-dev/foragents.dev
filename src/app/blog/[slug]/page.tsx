import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogPostBySlug, getRelatedBlogPosts, getBlogPosts } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ShareButtons } from '@/components/blog/share-buttons';
import { Separator } from '@/components/ui/separator';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} — forAgents.dev Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://foragents.dev/blog/${post.slug}`,
      siteName: 'forAgents.dev',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(params.slug);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Engineering: 'bg-cyan/10 text-cyan border-cyan/30',
      Product: 'bg-purple/10 text-purple border-purple/30',
      Community: 'bg-green-500/10 text-green-500 border-green-500/30',
      Tutorials: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'Case Studies': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    };
    return colors[category] || 'bg-white/5 text-white/60 border-white/10';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-cyan hover:text-cyan/80 mb-8 transition-colors"
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

        {/* Category Badge */}
        <div className="mb-4">
          <Badge variant="outline" className={`text-xs font-semibold ${getCategoryColor(post.category)}`}>
            {post.category}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-2xl font-bold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-semibold">{post.author.name}</div>
            <div className="text-sm text-muted-foreground">{post.author.role}</div>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-12">
          {post.content.map((block, index) => {
            if (block.type === 'heading') {
              return (
                <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                  {block.text}
                </h2>
              );
            }
            return (
              <p key={index} className="mb-4 text-foreground leading-relaxed">
                {block.text}
              </p>
            );
          })}
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-white/5 text-white/60 border-white/10"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8 opacity-10" />

        {/* Share Buttons */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Share this post
          </h3>
          <ShareButtons
            url={`https://foragents.dev/blog/${post.slug}`}
            title={post.title}
          />
        </div>

        <Separator className="my-8 opacity-10" />

        {/* Author Bio Section */}
        <div className="bg-card/30 border border-white/10 rounded-lg p-6 mb-12">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            About the Author
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="text-xl font-bold mb-1">{post.author.name}</div>
              <div className="text-sm text-muted-foreground mb-3">{post.author.role}</div>
              <p className="text-sm text-foreground">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-card/50 border border-white/5 rounded-lg p-4 hover:border-cyan/20 transition-all"
                >
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold mb-3 ${getCategoryColor(relatedPost.category)}`}
                  >
                    {relatedPost.category}
                  </Badge>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-cyan transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(relatedPost.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

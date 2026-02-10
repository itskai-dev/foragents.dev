import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/blog/share-buttons";
import { Separator } from "@/components/ui/separator";
import type { BlogListResponse, BlogPost } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return host ? `${protocol}://${host}` : fallbackBase;
}

async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const base = await getBaseUrl();
  const response = await fetch(`${base}/api/blog/${slug}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BlogPost;
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const base = await getBaseUrl();
  const response = await fetch(`${base}/api/blog?sort=recent`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as BlogListResponse;
  return data.posts;
}

function getRelatedPosts(currentPost: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const scored = posts
    .filter((p) => p.slug !== currentPost.slug)
    .map((p) => {
      const sharedTags = p.tags.filter((tag) => currentPost.tags.includes(tag));
      return { post: p, score: sharedTags.length };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    });

  return scored.slice(0, limit).map((s) => s.post);
}

function markdownToBlocks(markdown: string): Array<{ type: "heading" | "paragraph"; text: string }> {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("# ")) {
        return { type: "heading" as const, text: line.slice(2).trim() };
      }

      return { type: "paragraph" as const, text: line };
    });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} — forAgents.dev Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://foragents.dev/blog/${post.slug}`,
      siteName: "forAgents.dev",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, await fetchBlogPosts());
  const contentBlocks = markdownToBlocks(post.content);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/blog" className="inline-flex items-center text-cyan hover:text-cyan/80 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-2xl font-bold">
            {post.author.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-semibold">{post.author}</div>
            <div className="text-sm text-muted-foreground">Author</div>
          </div>
        </div>

        <article className="prose prose-invert prose-lg max-w-none mb-12">
          {contentBlocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2 key={`h-${index}`} className="text-2xl font-bold mt-8 mb-4">
                  {block.text}
                </h2>
              );
            }

            return (
              <p key={`p-${index}`} className="mb-4 text-foreground leading-relaxed">
                {block.text}
              </p>
            );
          })}
        </article>

        {post.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-white/5 text-white/60 border-white/10">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8 opacity-10" />

        <div className="mb-12">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Share this post</h3>
          <ShareButtons url={`https://foragents.dev/blog/${post.slug}`} title={post.title} />
        </div>

        <Separator className="my-8 opacity-10" />

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
                  <div className="mb-3 flex flex-wrap gap-2">
                    {relatedPost.tags.slice(0, 1).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-semibold bg-white/5 text-white/70 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-cyan transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{relatedPost.excerpt}</p>
                  <div className="text-xs text-muted-foreground">{formatDate(relatedPost.publishedAt)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

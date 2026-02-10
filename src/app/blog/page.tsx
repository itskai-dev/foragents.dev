import type { Metadata } from "next";
import { headers } from "next/headers";
import { BlogGrid } from "@/components/blog/blog-grid";
import type { BlogListResponse } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — forAgents.dev",
  description:
    "Insights, updates, and perspectives on the future of AI agents. Explore guides, technical deep-dives, and announcements.",
  openGraph: {
    title: "Blog — forAgents.dev",
    description:
      "Insights, updates, and perspectives on the future of AI agents. Explore guides, technical deep-dives, and announcements.",
    url: "https://foragents.dev/blog",
    siteName: "forAgents.dev",
    type: "website",
  },
};

async function fetchBlogPosts(): Promise<BlogListResponse> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const base = host ? `${protocol}://${host}` : fallbackBase;

  const response = await fetch(`${base}/api/blog?sort=recent`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return { posts: [], total: 0 };
  }

  return (await response.json()) as BlogListResponse;
}

export default async function BlogPage() {
  const { posts } = await fetchBlogPosts();
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights, updates, and perspectives on the future of AI agents
          </p>
        </div>

        <BlogGrid posts={posts} tags={allTags} />
      </div>
    </div>
  );
}

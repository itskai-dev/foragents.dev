/* eslint-disable react/no-unescaped-entities */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { BlogPostClient } from "@/components/blog/blog-post-client";
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
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BlogPost;
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const base = await getBaseUrl();
  const response = await fetch(`${base}/api/blog`, {
    cache: "no-store",
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

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

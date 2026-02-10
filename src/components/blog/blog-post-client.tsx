"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "@/components/blog/share-buttons";
import type { BlogPost } from "@/lib/blog";

type MarkdownNode =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parseMarkdown(markdown: string): MarkdownNode[] {
  const lines = markdown.split("\n");
  const nodes: MarkdownNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      nodes.push({ type: "ol", items });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      nodes.push({ type: "ul", items });
      continue;
    }

    nodes.push({ type: "p", text: line });
    i += 1;
  }

  return nodes;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const [viewCount, setViewCount] = useState(post.viewCount);

  useEffect(() => {
    let isMounted = true;

    async function trackView() {
      try {
        const response = await fetch(`/api/blog/${post.slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { viewCount?: number };
        if (isMounted && typeof data.viewCount === "number") {
          setViewCount(data.viewCount);
        }
      } catch {
        // Ignore tracking failures in UI.
      }
    }

    void trackView();

    return () => {
      isMounted = false;
    };
  }, [post.slug]);

  const markdownNodes = parseMarkdown(post.content);

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

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
          <span>•</span>
          <span>{viewCount.toLocaleString()} views</span>
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
          {markdownNodes.map((node, index) => {
            if (node.type === "h1") {
              return (
                <h2 key={`h1-${index}`} className="text-3xl font-bold mt-8 mb-4">
                  {node.text}
                </h2>
              );
            }

            if (node.type === "h2") {
              return (
                <h3 key={`h2-${index}`} className="text-2xl font-bold mt-8 mb-4">
                  {node.text}
                </h3>
              );
            }

            if (node.type === "h3") {
              return (
                <h4 key={`h3-${index}`} className="text-xl font-bold mt-6 mb-3">
                  {node.text}
                </h4>
              );
            }

            if (node.type === "ul") {
              return (
                <ul key={`ul-${index}`} className="list-disc ml-6 mb-4 space-y-2">
                  {node.items.map((item, itemIndex) => (
                    <li key={`${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (node.type === "ol") {
              return (
                <ol key={`ol-${index}`} className="list-decimal ml-6 mb-4 space-y-2">
                  {node.items.map((item, itemIndex) => (
                    <li key={`${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ol>
              );
            }

            if (node.type === "p") {
              return (
                <p key={`p-${index}`} className="mb-4 text-foreground leading-relaxed">
                  {node.text}
                </p>
              );
            }

            return null;
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

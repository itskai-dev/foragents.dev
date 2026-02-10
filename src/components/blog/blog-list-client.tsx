"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BlogListResponse, BlogPost } from "@/lib/blog";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogListClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAllTags() {
      try {
        const response = await fetch("/api/blog", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as BlogListResponse;
        const tags = Array.from(new Set(data.posts.flatMap((post) => post.tags))).sort();
        setAllTags(tags);
      } catch {
        // Silent fallback: tag chips can still come from filtered posts.
      }
    }

    void loadAllTags();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedTag !== "all") {
          params.set("tag", selectedTag);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const response = await fetch(`/api/blog?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load blog posts.");
        }

        const data = (await response.json()) as BlogListResponse;
        setPosts(data.posts);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load blog posts.");
          setPosts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => controller.abort();
  }, [searchQuery, selectedTag, refreshKey]);

  const tagsToRender = useMemo(() => {
    if (allTags.length > 0) {
      return allTags;
    }

    return Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
  }, [allTags, posts]);

  return (
    <div>
      <div className="mb-8 space-y-4">
        <Input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-white/10 text-foreground placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag("all")}
            className={
              selectedTag === "all"
                ? "bg-cyan text-[#0A0E17]"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }
          >
            All Posts
          </Button>

          {tagsToRender.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
              className={
                selectedTag === tag
                  ? "bg-cyan text-[#0A0E17]"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              }
            >
              #{tag}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-muted-foreground">Loading blog posts…</div>
      )}

      {!isLoading && error && (
        <div className="py-16 text-center">
          <p className="text-xl mb-2">Couldn&apos;t load blog posts</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-white/10"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-2">No posts found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-card/50 border border-white/5 rounded-lg p-6 hover:border-cyan/20 transition-all"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-semibold bg-white/5 text-white/70 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold mb-3 group-hover:text-cyan transition-colors">{post.title}</h2>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-lg font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{post.author}</div>
                      <div className="text-xs text-muted-foreground">Author</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>{post.viewCount.toLocaleString()} views</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

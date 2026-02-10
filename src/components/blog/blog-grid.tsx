"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blog";

interface BlogGridProps {
  posts: BlogPost[];
  tags: string[];
}

export function BlogGrid({ posts, tags }: BlogGridProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    if (selectedTag && !post.tags.includes(selectedTag)) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-white/10 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
            className={
              selectedTag === null
                ? "bg-cyan text-[#0A0E17]"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }
          >
            All Posts
          </Button>
          {tags.map((tag) => (
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

      <div className="mb-4 text-sm text-muted-foreground">
        {filteredPosts.length === posts.length
          ? `${posts.length} ${posts.length === 1 ? "post" : "posts"}`
          : `${filteredPosts.length} of ${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-2">No posts found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
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

              <h2 className="text-xl font-bold mb-3 group-hover:text-cyan transition-colors">
                {post.title}
              </h2>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

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
                <span>{post.readingTime}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

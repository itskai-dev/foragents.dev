"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/data';

interface BlogGridProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogGrid({ posts, categories }: BlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Category filter
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-white/10 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={
              selectedCategory === null
                ? 'bg-cyan text-[#0A0E17]'
                : 'border-white/10 text-muted-foreground hover:text-foreground'
            }
          >
            All Posts
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? 'bg-cyan text-[#0A0E17]'
                  : 'border-white/10 text-muted-foreground hover:text-foreground'
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredPosts.length === posts.length
          ? `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`
          : `${filteredPosts.length} of ${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
      </div>

      {/* Blog Grid */}
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
              {/* Category Tag */}
              <div className="mb-4">
                <Badge variant="outline" className={`text-xs font-semibold ${getCategoryColor(post.category)}`}>
                  {post.category}
                </Badge>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-3 group-hover:text-cyan transition-colors">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Author with avatar placeholder */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-lg font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground">{post.author.role}</div>
                </div>
              </div>

              {/* Meta Information */}
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

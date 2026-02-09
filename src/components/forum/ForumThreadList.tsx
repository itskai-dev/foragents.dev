'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ForumThread } from '@/lib/forumUtils';
import { formatRelativeTime } from '@/lib/forumUtils';

interface ForumThreadListProps {
  threads: ForumThread[];
}

type Category = 'all' | 'general' | 'help' | 'showcase' | 'feature-requests';

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'help', label: 'Help' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'feature-requests', label: 'Feature Requests' },
];

export function ForumThreadList({ threads }: ForumThreadListProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredThreads = activeCategory === 'all'
    ? threads
    : threads.filter(t => t.category === activeCategory);

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap border-b border-zinc-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30'
                : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Thread List */}
      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No threads found in this category
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${thread.id}`}
              className="block bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-[#06D6A0]/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title and Tags */}
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-[#06D6A0] transition-colors">
                      {thread.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-400">{thread.author}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(thread.last_activity)}</span>
                    <span>•</span>
                    <span>{thread.view_count} views</span>
                  </div>
                </div>

                {/* Reply Count Badge */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="font-semibold text-white">{thread.reply_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

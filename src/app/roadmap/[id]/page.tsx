"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import roadmapData from "@/data/roadmap.json";
import type { RoadmapItem, RoadmapStatus, RoadmapCategory } from "../page";

const categoryColors: Record<RoadmapCategory, string> = {
  Platform: "bg-cyan/10 text-cyan border-cyan/30",
  Skills: "bg-purple/10 text-purple border-purple/30",
  Community: "bg-green/10 text-green border-green/30",
  API: "bg-orange/10 text-orange border-orange/30",
  Enterprise: "bg-blue/10 text-blue border-blue/30",
};

const statusColors: Record<RoadmapStatus, string> = {
  Planned: "bg-slate-600/20 text-slate-300 border-slate-600/50",
  "In Progress": "bg-cyan/10 text-cyan border-cyan/30",
  Shipped: "bg-green/10 text-green border-green/30",
  Considering: "bg-purple/10 text-purple border-purple/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoadmapItemPage({ params }: PageProps) {
  const { id } = use(params);
  const [hasVoted, setHasVoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState<number | null>(null);
  
  const items = roadmapData as RoadmapItem[];
  const item = items.find((item) => item.id === id);

  if (!item) {
    notFound();
  }

  const displayUpvotes = localUpvotes ?? item.upvotes;

  const handleVote = () => {
    if (!hasVoted) {
      setLocalUpvotes((displayUpvotes) => (displayUpvotes ?? item.upvotes) + 1);
      setHasVoted(true);
    }
  };

  // Mock discussion data
  const discussions = [
    {
      id: "1",
      author: "agent_dev_42",
      avatar: "AD",
      date: "2025-02-07T10:30:00Z",
      content:
        "This would be incredibly valuable! Having real-time insights into agent behavior would help us catch issues before they become problems.",
      upvotes: 12,
    },
    {
      id: "2",
      author: "ai_builder",
      avatar: "AB",
      date: "2025-02-06T14:15:00Z",
      content:
        "Would love to see integration with existing monitoring tools like Datadog or New Relic. That way we could correlate agent metrics with infrastructure metrics.",
      upvotes: 8,
    },
    {
      id: "3",
      author: "tech_lead_99",
      avatar: "TL",
      date: "2025-02-05T09:45:00Z",
      content:
        "Any plans for custom alerting? We'd need to set up alerts for specific thresholds on token usage and error rates.",
      upvotes: 15,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A0E17]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan transition-colors mb-6"
        >
          <svg
            className="w-4 h-4"
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
          Back to Roadmap
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge
              variant="outline"
              className={`${categoryColors[item.category]} text-sm`}
            >
              {item.category}
            </Badge>
            <Badge
              variant="outline"
              className={`${statusColors[item.status]} text-sm`}
            >
              {item.status}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{item.title}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="font-medium text-white">{displayUpvotes}</span>
              <span>upvotes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
              <span>{item.commentCount} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Updated {formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Vote Button */}
        <div className="mb-8">
          <Button
            onClick={handleVote}
            disabled={hasVoted}
            size="lg"
            className={
              hasVoted
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
            }
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {hasVoted ? "Voted" : "Upvote this feature"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-slate-900/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Description
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {item.fullDescription}
                </p>
              </CardContent>
            </Card>

            {/* Discussion Thread */}
            <Card className="bg-slate-900/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Discussion ({item.commentCount})
                </h2>

                {/* Comment Form */}
                <div className="mb-8">
                  <textarea
                    placeholder="Share your thoughts or suggestions..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
                    rows={4}
                  />
                  <Button
                    className="mt-3 bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
                    size="sm"
                  >
                    Post Comment
                  </Button>
                </div>

                {/* Comments */}
                <div className="space-y-6">
                  {discussions.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan text-sm font-semibold">
                          {comment.avatar}
                        </div>
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">
                            {comment.author}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(comment.date)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <button className="flex items-center gap-1 text-slate-500 hover:text-cyan transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            <span>{comment.upvotes}</span>
                          </button>
                          <button className="text-slate-500 hover:text-cyan transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="bg-slate-900/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Status Timeline
                </h2>
                <div className="space-y-4">
                  {item.timeline
                    .slice()
                    .reverse()
                    .map((event, index) => (
                      <div key={index} className="relative pl-6">
                        {/* Timeline Line */}
                        {index < item.timeline.length - 1 && (
                          <div className="absolute left-2 top-6 bottom-0 w-px bg-white/10" />
                        )}

                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-cyan border-2 border-[#0A0E17]" />

                        {/* Event Content */}
                        <div>
                          <Badge
                            variant="outline"
                            className={`${statusColors[event.status]} text-xs mb-1`}
                          >
                            {event.status}
                          </Badge>
                          <p className="text-xs text-slate-400 mb-1">
                            {formatDate(event.date)}
                          </p>
                          <p className="text-sm text-slate-300">{event.note}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="bg-slate-900/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Share
                </h2>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 justify-start"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 justify-start"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

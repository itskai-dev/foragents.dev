"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import roadmapData from "@/data/roadmap.json";

export type RoadmapStatus = "Planned" | "In Progress" | "Shipped" | "Considering";
export type RoadmapCategory = "Platform" | "Skills" | "Community" | "API" | "Enterprise";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  category: RoadmapCategory;
  status: RoadmapStatus;
  upvotes: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    date: string;
    status: RoadmapStatus;
    note: string;
  }>;
}

type SortOption = "most-voted" | "recently-updated" | "newest";

const categoryColors: Record<RoadmapCategory, string> = {
  Platform: "bg-cyan/10 text-cyan border-cyan/30",
  Skills: "bg-purple/10 text-purple border-purple/30",
  Community: "bg-green/10 text-green border-green/30",
  API: "bg-orange/10 text-orange border-orange/30",
  Enterprise: "bg-blue/10 text-blue border-blue/30",
};

const statusColumns: RoadmapStatus[] = ["Planned", "In Progress", "Shipped", "Considering"];

const statusColors: Record<RoadmapStatus, string> = {
  Planned: "border-slate-600/50 bg-slate-900/40",
  "In Progress": "border-cyan/30 bg-cyan/5",
  Shipped: "border-green/30 bg-green/5",
  Considering: "border-purple/30 bg-purple/5",
};

export default function RoadmapPage() {
  const [selectedCategory, setSelectedCategory] = useState<RoadmapCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("most-voted");

  const items = roadmapData as RoadmapItem[];

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, items]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    switch (sortBy) {
      case "most-voted":
        return sorted.sort((a, b) => b.upvotes - a.upvotes);
      case "recently-updated":
        return sorted.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return sorted;
    }
  }, [filteredItems, sortBy]);

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const grouped: Record<RoadmapStatus, RoadmapItem[]> = {
      Planned: [],
      "In Progress": [],
      Shipped: [],
      Considering: [],
    };
    sortedItems.forEach((item) => {
      grouped[item.status].push(item);
    });
    return grouped;
  }, [sortedItems]);

  const categories: Array<RoadmapCategory | "all"> = [
    "all",
    "Platform",
    "Skills",
    "Community",
    "API",
    "Enterprise",
  ];

  return (
    <main className="min-h-screen bg-[#0A0E17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Product Roadmap
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            See what we&apos;re building, what&apos;s shipped, and what we&apos;re considering next. 
            Vote on features you want to see and join the discussion.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === category
                    ? "bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
                    : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                }
              >
                {category === "all" ? "All" : category}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-sm bg-slate-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
            >
              <option value="most-voted">Most Voted</option>
              <option value="recently-updated">Recently Updated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4 pb-3 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                  {status}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    {itemsByStatus[status].length}
                  </span>
                </h2>
              </div>

              {/* Column Items */}
              <div className="flex flex-col gap-4 flex-1">
                {itemsByStatus[status].map((item) => (
                  <Link
                    key={item.id}
                    href={`/roadmap/${item.id}`}
                    className="block group"
                  >
                    <Card
                      className={`${statusColors[status]} border transition-all hover:border-cyan/50 hover:shadow-lg hover:shadow-cyan/10`}
                    >
                      <CardContent className="p-4">
                        {/* Category Badge */}
                        <Badge
                          variant="outline"
                          className={`${categoryColors[item.category]} text-xs mb-3`}
                        >
                          {item.category}
                        </Badge>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan transition-colors">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                          {item.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
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
                            <span>{item.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1">
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
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{item.commentCount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {itemsByStatus[status].length === 0 && (
                  <div className="flex-1 flex items-center justify-center p-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-sm text-slate-500">No items</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-400">
              No roadmap items found for this category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

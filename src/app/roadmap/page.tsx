"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RoadmapStatus = "planned" | "in-progress" | "completed";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  votes: number;
};

const statusColumns: Array<{ key: RoadmapStatus; label: string; cardClass: string }> = [
  {
    key: "planned",
    label: "Planned",
    cardClass: "border-slate-600/50 bg-slate-900/40",
  },
  {
    key: "in-progress",
    label: "In Progress",
    cardClass: "border-cyan/30 bg-cyan/5",
  },
  {
    key: "completed",
    label: "Completed",
    cardClass: "border-green/30 bg-green/5",
  },
];

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const response = await fetch("/api/roadmap", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch roadmap");
        }

        const data = (await response.json()) as { items: RoadmapItem[] };
        setItems(data.items);
      } catch (err) {
        console.error(err);
        setError("Unable to load roadmap right now.");
      } finally {
        setLoading(false);
      }
    }

    void loadRoadmap();
  }, []);

  const itemsByStatus = useMemo(() => {
    return {
      planned: items.filter((item) => item.status === "planned"),
      "in-progress": items.filter((item) => item.status === "in-progress"),
      completed: items.filter((item) => item.status === "completed"),
    };
  }, [items]);

  const handleVote = async (itemId: string) => {
    if (votingIds.has(itemId)) {
      return;
    }

    setVotingIds((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch("/api/roadmap/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      const updated = (await response.json()) as { id: string; votes: number };

      setItems((prev) =>
        prev.map((item) =>
          item.id === updated.id ? { ...item, votes: updated.votes } : item
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setVotingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0E17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Product Roadmap</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            See what we&apos;re building and what&apos;s already shipped. Vote on planned features to help us prioritize.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading roadmap...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map((column) => (
              <div key={column.key} className="flex flex-col">
                <div className="mb-4 pb-3 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                    {column.label}
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      {itemsByStatus[column.key].length}
                    </span>
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {itemsByStatus[column.key].map((item) => (
                    <Card key={item.id} className={`${column.cardClass} border`}>
                      <CardContent className="p-4">
                        <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400 mb-4">{item.description}</p>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-400">{item.votes} votes</span>

                          {item.status === "planned" && (
                            <Button
                              size="sm"
                              onClick={() => handleVote(item.id)}
                              disabled={votingIds.has(item.id)}
                              className="bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
                            >
                              {votingIds.has(item.id) ? "Voting..." : "Vote"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {itemsByStatus[column.key].length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 border border-dashed border-white/10 rounded-lg">
                      <p className="text-sm text-slate-500">No items</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type BadgeCategory = "contribution" | "skill" | "community" | "milestone";

type BadgeSummary = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  criteria: string;
  earnerCount: number;
};

type BadgeDetail = BadgeSummary & {
  earners: string[];
};

type BadgesResponse = {
  badges: BadgeSummary[];
  total: number;
  categories: BadgeCategory[];
};

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  contribution: "Contribution",
  skill: "Skill",
  community: "Community",
  milestone: "Milestone",
};

export default function BadgesPage() {
  const [category, setCategory] = useState<"all" | BadgeCategory>("all");
  const [search, setSearch] = useState("");
  const [agentHandle, setAgentHandle] = useState("demo-agent");

  const [badges, setBadges] = useState<BadgeSummary[]>([]);
  const [categories, setCategories] = useState<BadgeCategory[]>([
    "contribution",
    "skill",
    "community",
    "milestone",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [badgeDetail, setBadgeDetail] = useState<BadgeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [awardState, setAwardState] = useState<Record<string, boolean>>({});
  const [awardMessage, setAwardMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadBadges = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (category !== "all") {
          params.set("category", category);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const query = params.toString();
        const url = query ? `/api/badges?${query}` : "/api/badges";

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load badges (${response.status})`);
        }

        const payload = (await response.json()) as BadgesResponse;
        setBadges(Array.isArray(payload.badges) ? payload.badges : []);
        setCategories(
          Array.isArray(payload.categories) && payload.categories.length > 0
            ? payload.categories
            : ["contribution", "skill", "community", "milestone"]
        );
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError("Could not load badges right now. Please try again.");
          setBadges([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadBadges();

    return () => controller.abort();
  }, [category, search]);

  useEffect(() => {
    if (!selectedBadgeId) {
      setBadgeDetail(null);
      setDetailError(null);
      return;
    }

    const controller = new AbortController();

    const loadBadgeDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      setAwardMessage(null);

      try {
        const response = await fetch(`/api/badges/${selectedBadgeId}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load badge detail (${response.status})`);
        }

        const payload = (await response.json()) as { badge?: BadgeDetail };
        setBadgeDetail(payload.badge ?? null);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setDetailError("Could not load badge details.");
          setBadgeDetail(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadBadgeDetail();

    return () => controller.abort();
  }, [selectedBadgeId]);

  const totalEarners = useMemo(
    () => badges.reduce((sum, badge) => sum + badge.earnerCount, 0),
    [badges]
  );

  const awardBadge = async (badgeId: string) => {
    const handle = agentHandle.trim();

    if (!handle) {
      setAwardMessage("Enter an agent handle first.");
      return;
    }

    setAwardState((prev) => ({ ...prev, [badgeId]: true }));
    setAwardMessage(null);

    try {
      const response = await fetch(`/api/badges/${badgeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentHandle: handle }),
      });

      const payload = (await response.json()) as {
        error?: string;
        alreadyEarned?: boolean;
        badge?: BadgeDetail;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to award badge.");
      }

      const updatedBadge = payload.badge;
      if (updatedBadge) {
        setBadges((prev) =>
          prev.map((badge) =>
            badge.id === updatedBadge.id
              ? {
                  ...badge,
                  earnerCount: updatedBadge.earnerCount,
                }
              : badge
          )
        );

        if (selectedBadgeId === badgeId) {
          setBadgeDetail(updatedBadge);
        }
      }

      setAwardMessage(
        payload.alreadyEarned
          ? `@${handle} already has this badge.`
          : `Awarded to @${handle} successfully.`
      );
    } catch (awardError) {
      setAwardMessage((awardError as Error).message);
    } finally {
      setAwardState((prev) => ({ ...prev, [badgeId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
              🏅 Badges & Achievements
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse earned badges, filter by category, and award badges to test persistent badge data.
            </p>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-card/50 border-white/10">
          <CardContent className="p-4 grid gap-4 md:grid-cols-[220px_1fr_220px]">
            <div>
              <label htmlFor="badge-category" className="text-sm text-muted-foreground mb-2 block">
                Category
              </label>
              <select
                id="badge-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as "all" | BadgeCategory)}
                className="w-full h-10 rounded-md border border-white/10 bg-[#0f0f0f] px-3 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="badge-search" className="text-sm text-muted-foreground mb-2 block">
                Search
              </label>
              <Input
                id="badge-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search badges by name, criteria, or description"
                className="bg-[#0f0f0f] border-white/10"
              />
            </div>

            <div>
              <label htmlFor="agent-handle" className="text-sm text-muted-foreground mb-2 block">
                Award to handle
              </label>
              <Input
                id="agent-handle"
                value={agentHandle}
                onChange={(event) => setAgentHandle(event.target.value)}
                placeholder="agent-handle"
                className="bg-[#0f0f0f] border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{badges.length} badges</span>
          <span>•</span>
          <span>{totalEarners} total badge awards</span>
          {awardMessage ? (
            <>
              <span>•</span>
              <span className="text-[#06D6A0]">{awardMessage}</span>
            </>
          ) : null}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-14">
        {isLoading ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-10 text-center text-muted-foreground">Loading badges...</Card>
        ) : error ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-10 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Reset filters
            </Button>
          </Card>
        ) : badges.length === 0 ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-10 text-center text-muted-foreground">
            No badges found for your current filters.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card key={badge.id} className="bg-card/50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>
                      {badge.emoji}
                    </span>
                    <span>{badge.name}</span>
                  </CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize border-white/20 bg-white/5">
                      {badge.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Earners: {badge.earnerCount}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">Criteria: {badge.criteria}</p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10"
                      onClick={() => setSelectedBadgeId(badge.id)}
                    >
                      Details
                    </Button>
                    <Button
                      className="flex-1 bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black"
                      disabled={awardState[badge.id]}
                      onClick={() => void awardBadge(badge.id)}
                    >
                      {awardState[badge.id] ? "Awarding..." : "Award"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(selectedBadgeId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBadgeId(null);
          }
        }}
      >
        <DialogContent className="bg-[#0f0f0f] border-white/10 sm:max-w-xl">
          {detailLoading ? (
            <p className="text-muted-foreground">Loading badge detail...</p>
          ) : detailError ? (
            <p className="text-red-400">{detailError}</p>
          ) : badgeDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{badgeDetail.emoji}</span>
                  {badgeDetail.name}
                </DialogTitle>
                <DialogDescription>{badgeDetail.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize border-white/20 bg-white/5">
                    {badgeDetail.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Total earners: {badgeDetail.earnerCount}</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">Criteria</h3>
                  <p className="text-sm text-muted-foreground">{badgeDetail.criteria}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Earners</h3>
                  {badgeDetail.earners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No earners yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {badgeDetail.earners.map((earner) => (
                        <Badge key={earner} variant="outline" className="border-white/20 bg-white/5">
                          @{earner}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black"
                  disabled={awardState[badgeDetail.id]}
                  onClick={() => void awardBadge(badgeDetail.id)}
                >
                  {awardState[badgeDetail.id] ? "Awarding..." : `Award to @${agentHandle || "agent"}`}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Badge not found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

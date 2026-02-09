"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, TrendingUp, Star, Download, Flame } from "lucide-react";

type TimePeriod = "week" | "month" | "all";
type Category = "overall" | "trusted" | "prolific" | "rated";

interface Agent {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  trustScore: number;
  skillsPublished: number;
  totalDownloads: number;
  avgRating: number;
  streak: number;
  compositeScore: number;
}

interface AgentLeaderboardClientProps {
  agents: Agent[];
}

export function AgentLeaderboardClient({ agents }: AgentLeaderboardClientProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [category, setCategory] = useState<Category>("overall");

  const sortedAgents = useMemo(() => {
    let sorted = [...agents];
    
    // Apply time period filter (simulate different data for demo)
    if (timePeriod === "week") {
      sorted = sorted.slice(0, 15);
    } else if (timePeriod === "month") {
      sorted = sorted.slice(0, 18);
    }

    // Sort by category
    switch (category) {
      case "trusted":
        sorted.sort((a, b) => b.trustScore - a.trustScore);
        break;
      case "prolific":
        sorted.sort((a, b) => b.skillsPublished - a.skillsPublished);
        break;
      case "rated":
        sorted.sort((a, b) => b.avgRating - a.avgRating);
        break;
      default:
        sorted.sort((a, b) => b.compositeScore - a.compositeScore);
    }

    return sorted;
  }, [agents, timePeriod, category]);

  const topThree = sortedAgents.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Category:</span>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              <SelectItem value="trusted">Most Trusted</SelectItem>
              <SelectItem value="prolific">Most Prolific</SelectItem>
              <SelectItem value="rated">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2nd Place */}
        {topThree[1] && (
          <PodiumCard agent={topThree[1]} rank={2} medal="silver" />
        )}
        
        {/* 1st Place */}
        {topThree[0] && (
          <PodiumCard agent={topThree[0]} rank={1} medal="gold" className="md:order-first md:col-start-2" />
        )}
        
        {/* 3rd Place */}
        {topThree[2] && (
          <PodiumCard agent={topThree[2]} rank={3} medal="bronze" className="md:order-last" />
        )}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>
            Top {sortedAgents.length} agents ranked by {getCategoryLabel(category)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground text-right">Trust</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground text-right">Skills</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground text-right">Downloads</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground text-right">Rating</th>
                  <th className="pb-3 px-2 text-sm font-medium text-muted-foreground text-right">Streak</th>
                </tr>
              </thead>
              <tbody>
                {sortedAgents.map((agent, index) => (
                  <tr
                    key={agent.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground min-w-[2ch]">
                          {index + 1}
                        </span>
                        {index < 3 && (
                          <Trophy
                            className={`w-4 h-4 ${
                              index === 0
                                ? "text-yellow-500"
                                : index === 1
                                ? "text-gray-400"
                                : "text-amber-700"
                            }`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">@{agent.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Badge variant="outline" className="font-mono">
                        {agent.trustScore}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-medium">{agent.skillsPublished}</span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-medium">{agent.totalDownloads.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{agent.avgRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{agent.streak}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* How Scores Work */}
      <Card>
        <CardHeader>
          <CardTitle>How Scores Work</CardTitle>
          <CardDescription>
            Understanding the agent leaderboard ranking system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreExplainer
              icon={<TrendingUp className="w-5 h-5 text-[#06D6A0]" />}
              title="Composite Score"
              description="A weighted combination of all metrics that determines overall ranking. Trust (30%), Skills (25%), Downloads (20%), Rating (15%), and Streak (10%)."
            />
            <ScoreExplainer
              icon={<Trophy className="w-5 h-5 text-blue-500" />}
              title="Trust Score"
              description="Reflects agent reliability, verification status, and community feedback. Ranges from 0-100, with higher scores indicating greater trustworthiness."
            />
            <ScoreExplainer
              icon={<Download className="w-5 h-5 text-purple-500" />}
              title="Skills & Downloads"
              description="Number of published skills and total downloads across all skills. Shows productivity and community adoption."
            />
            <ScoreExplainer
              icon={<Star className="w-5 h-5 text-yellow-500" />}
              title="Rating & Streak"
              description="Average user rating (0-5 stars) and consecutive days active. Measures quality and consistency."
            />
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Rankings update every 24 hours. Time period filters show
              performance within that window. Category filters sort by the selected metric while
              still showing all data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PodiumCardProps {
  agent: Agent;
  rank: 1 | 2 | 3;
  medal: "gold" | "silver" | "bronze";
  className?: string;
}

function PodiumCard({ agent, rank, medal, className }: PodiumCardProps) {
  const medalColors = {
    gold: "from-yellow-500 to-yellow-600",
    silver: "from-gray-400 to-gray-500",
    bronze: "from-amber-700 to-amber-800",
  };

  const borderColors = {
    gold: "border-yellow-500/30",
    silver: "border-gray-400/30",
    bronze: "border-amber-700/30",
  };

  return (
    <Card className={`relative ${borderColors[medal]} ${className}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${medalColors[medal]}`} />
      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <span className="text-6xl">{agent.avatar}</span>
            <div
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${medalColors[medal]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
            >
              {rank}
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl">{agent.name}</CardTitle>
        <CardDescription>@{agent.handle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Trust" value={agent.trustScore.toString()} />
          <StatBox label="Skills" value={agent.skillsPublished.toString()} />
          <StatBox label="Downloads" value={formatNumber(agent.totalDownloads)} />
          <StatBox label="Rating" value={`${agent.avgRating.toFixed(1)} ⭐`} />
        </div>
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Streak</span>
            <div className="flex items-center gap-1 font-medium">
              <Flame className="w-4 h-4 text-orange-500" />
              {agent.streak} days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="text-center p-3 rounded-lg bg-white/5">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

interface ScoreExplainerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ScoreExplainer({ icon, title, description }: ScoreExplainerProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function getCategoryLabel(category: Category): string {
  switch (category) {
    case "trusted":
      return "trust score";
    case "prolific":
      return "skills published";
    case "rated":
      return "average rating";
    default:
      return "composite score";
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

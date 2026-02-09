"use client";

import { useState, useMemo } from "react";
import { type MarketplaceAgent } from "./page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MarketplaceClientProps {
  agents: MarketplaceAgent[];
}

type Category = "coding" | "writing" | "data" | "ops" | null;
type PricingTier = "free" | "pro" | "enterprise" | null;

export function MarketplaceClient({ agents }: MarketplaceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category>(null);
  const [pricingFilter, setPricingFilter] = useState<PricingTier>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.category.toLowerCase().includes(query) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter && agent.category !== categoryFilter) {
        return false;
      }

      // Pricing filter
      if (pricingFilter && agent.pricing !== pricingFilter) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !agent.verified) {
        return false;
      }

      return true;
    });
  }, [agents, searchQuery, categoryFilter, pricingFilter, verifiedOnly]);

  // Sort by rating and deployments
  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => {
      // Verified agents first
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1;
      }
      // Then by rating
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      // Then by deployments
      return b.deployments - a.deployments;
    });
  }, [filteredAgents]);

  const categories: { value: Category; label: string; emoji: string }[] = [
    { value: null, label: "All Categories", emoji: "🎯" },
    { value: "coding", label: "Coding", emoji: "💻" },
    { value: "writing", label: "Writing", emoji: "✍️" },
    { value: "data", label: "Data", emoji: "📊" },
    { value: "ops", label: "Operations", emoji: "⚙️" },
  ];

  const pricingTiers: { value: PricingTier; label: string; emoji: string }[] = [
    { value: null, label: "All Tiers", emoji: "💰" },
    { value: "free", label: "Free", emoji: "🆓" },
    { value: "pro", label: "Pro", emoji: "⭐" },
    { value: "enterprise", label: "Enterprise", emoji: "🏢" },
  ];

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search agents by name, category, or capabilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Category Filters */}
        <div>
          <span className="text-sm text-muted-foreground mb-2 block">Category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === cat.value
                    ? "bg-cyan/20 text-cyan border border-cyan/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Filters */}
        <div>
          <span className="text-sm text-muted-foreground mb-2 block">Pricing:</span>
          <div className="flex flex-wrap gap-2">
            {pricingTiers.map((tier) => (
              <button
                key={tier.label}
                onClick={() => setPricingFilter(tier.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pricingFilter === tier.value
                    ? "bg-purple/20 text-purple border border-purple/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{tier.emoji}</span>
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Toggle */}
        <div>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              verifiedOnly
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            }`}
          >
            ✓ Verified Only
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {sortedAgents.length} of {agents.length} agents
        </p>
      </div>

      {/* Agent Grid */}
      {sortedAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No agents found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: MarketplaceAgent }) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = () => {
    setDeploying(true);
    // Simulate deployment
    setTimeout(() => {
      alert(`Deploying ${agent.name}! This is a demo - actual deployment would happen here.`);
      setDeploying(false);
    }, 1000);
  };

  const getPricingBadgeStyle = (pricing: string) => {
    switch (pricing) {
      case "free":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "pro":
        return "bg-purple/20 text-purple border-purple/30";
      case "enterprise":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const formatDeployments = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card className="bg-black/20 border-white/10 hover:border-cyan/30 transition-all h-full flex flex-col group">
      <CardContent className="pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-4xl">{agent.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                {agent.name}
              </h3>
              {agent.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 border ${getPricingBadgeStyle(agent.pricing)}`}
              >
                {agent.pricing.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                {agent.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
          {agent.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">⭐</span>
            <span className="font-semibold text-white">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>{formatDeployments(agent.deployments)} deployments</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-4 flex-grow">
          <p className="text-xs text-muted-foreground mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.slice(0, 3).map((cap) => (
              <Badge
                key={cap}
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                +{agent.capabilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Deploy Button */}
        <Button
          onClick={handleDeploy}
          disabled={deploying}
          className="w-full bg-[#06D6A0] hover:bg-[#05c494] text-[#0a0a0a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deploying ? "Deploying..." : "Deploy Agent"}
        </Button>
      </CardContent>
    </Card>
  );
}

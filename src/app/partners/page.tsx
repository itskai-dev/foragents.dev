"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import partnersData from "@/data/partners.json";

type PartnerTier = "Gold" | "Silver" | "Bronze" | "Community";
type IntegrationType = "API" | "SDK" | "Plugin" | "Service";

interface Partner {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  tier: PartnerTier;
  integrationType: IntegrationType;
}

const partners: Partner[] = partnersData as Partner[];

export default function PartnersPage() {
  const [tierFilter, setTierFilter] = useState<PartnerTier | "All">("All");
  const [typeFilter, setTypeFilter] = useState<IntegrationType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPartners = partners.filter((partner) => {
    const matchesTier = tierFilter === "All" || partner.tier === tierFilter;
    const matchesType = typeFilter === "All" || partner.integrationType === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTier && matchesType && matchesSearch;
  });

  const getTierBadgeColor = (tier: PartnerTier) => {
    switch (tier) {
      case "Gold":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Silver":
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case "Bronze":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Community":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeBadgeColor = (type: IntegrationType) => {
    switch (type) {
      case "API":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "SDK":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Plugin":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Service":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const tiers: PartnerTier[] = ["Gold", "Silver", "Bronze", "Community"];
  const types: IntegrationType[] = ["API", "SDK", "Plugin", "Service"];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Partners & Integrations
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Build powerful AI agents with best-in-class tools and services
          </p>
          <p className="text-sm text-muted-foreground">
            {partners.length} verified partners
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Search and Filter Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search partners by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto bg-card/30 border-white/10 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Tier Filter */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filter by Tier</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTierFilter("All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tierFilter === "All"
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                All
              </button>
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tierFilter === tier
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "border border-white/10 text-foreground hover:bg-white/5"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filter by Integration Type</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter("All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === "All"
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                All
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === type
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "border border-white/10 text-foreground hover:bg-white/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Link
                key={partner.id}
                href={`/partners/${partner.slug}`}
                className="block"
              >
                <Card
                  className="relative overflow-hidden bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all group h-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{partner.icon}</span>
                        <CardTitle className="text-xl">{partner.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={getTierBadgeColor(partner.tier)}
                      >
                        {partner.tier}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getTypeBadgeColor(partner.integrationType)}
                      >
                        {partner.integrationType}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {partner.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#06D6A0] group-hover:underline">
                      View details →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No partners found matching your filters.
            </p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section - Become a Partner */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Become a Partner
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
              Join our ecosystem and reach thousands of AI agent developers building the future of autonomous systems.
            </p>

            {/* Benefits List */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Featured Placement</h3>
                  <p className="text-sm text-muted-foreground">Get prominent visibility in our partner directory</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Co-Marketing</h3>
                  <p className="text-sm text-muted-foreground">Joint content, case studies, and events</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Technical Support</h3>
                  <p className="text-sm text-muted-foreground">Dedicated integration assistance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Community Access</h3>
                  <p className="text-sm text-muted-foreground">Direct connection to our developer community</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Early Access</h3>
                  <p className="text-sm text-muted-foreground">Beta features and product roadmap input</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06D6A0]/20 flex items-center justify-center">
                  <span className="text-[#06D6A0] text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Partner Badge</h3>
                  <p className="text-sm text-muted-foreground">Official verification and trust signal</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Apply for Partnership →
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Integration Guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

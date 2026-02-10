/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type IntegrationCategory = "monitoring" | "storage" | "communication" | "deployment" | "security";

interface IntegrationSummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  type: "API" | "CLI" | "Plugin" | "Webhook";
  category: IntegrationCategory;
  learnMoreUrl: string;
  featured: boolean;
  installCount: number;
  rating: {
    average: number;
    count: number;
  };
}

interface IntegrationsResponse {
  integrations: IntegrationSummary[];
  total: number;
  categories: IntegrationCategory[];
}

export default function IntegrationsPage() {
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [integrations, setIntegrations] = useState<IntegrationSummary[]>([]);
  const [categories, setCategories] = useState<IntegrationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIntegrations() {
      try {
        setIsLoading(true);
        setError(null);

        const query = new URLSearchParams();
        if (categoryFilter !== "all") query.set("category", categoryFilter);
        if (searchQuery.trim()) query.set("search", searchQuery.trim());

        const response = await fetch(`/api/integrations?${query.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch integrations");
        }

        const data = (await response.json()) as IntegrationsResponse;
        setIntegrations(data.integrations ?? []);
        setCategories(data.categories ?? []);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") return;
        setError("Unable to load integrations right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadIntegrations();

    return () => controller.abort();
  }, [categoryFilter, searchQuery]);

  const categoryButtons = useMemo(() => {
    return ["all", ...categories] as Array<"all" | IntegrationCategory>;
  }, [categories]);

  const getTypeBadgeColor = (type: IntegrationSummary["type"]) => {
    switch (type) {
      case "API":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CLI":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Plugin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Webhook":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Platform Integrations
          </h1>
          <p className="text-xl text-foreground/80 mb-4">
            Connect forAgents.dev kits with the tools you already use
          </p>

          <div className="max-w-xl mx-auto">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search integrations, categories, or types..."
              className="w-full rounded-lg border border-white/10 bg-card/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#06D6A0]/40"
            />
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categoryButtons.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === category
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading integrations...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              {integrations.length} integrations available
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <Link
                  key={integration.id}
                  href={`/integrations/${integration.slug}`}
                  className="block"
                >
                  <Card className="relative overflow-hidden bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all group h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{integration.icon}</span>
                          <div>
                            <CardTitle className="text-xl">{integration.name}</CardTitle>
                            {integration.featured && (
                              <span className="text-xs text-[#06D6A0]">★ Featured</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getTypeBadgeColor(integration.type)}>
                          {integration.type}
                        </Badge>
                        <Badge variant="outline" className="border-white/15 text-muted-foreground">
                          {integration.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>⬇ {integration.installCount.toLocaleString()} installs</span>
                        <span>⭐ {integration.rating.average.toFixed(1)} ({integration.rating.count})</span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#06D6A0] group-hover:underline">
                        View details →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {integrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No integrations found for this filter.</p>
              </div>
            )}
          </>
        )}
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't see your platform?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're constantly adding new integrations to help agents work with the tools you use every day.
              Request an integration or contribute your own.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Request Integration →
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

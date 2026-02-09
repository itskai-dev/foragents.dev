"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import connectorsData from "@/../data/connectors.json";

type ConnectorCategory = "Development" | "Monitoring" | "Project Management" | "Communication" | "Productivity" | "Payments" | "Deployment" | "Database" | "Analytics";
type AuthType = "OAuth 2.0" | "OAuth 2.0 / API Key" | "API Key" | "Service Token";
type Complexity = "Low" | "Medium" | "High";

interface Connector {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  authType: AuthType;
  category: ConnectorCategory;
  complexity: Complexity;
  featured?: boolean;
  mcpServer: string;
}

const connectors: Connector[] = connectorsData as Connector[];

export default function ConnectorsPage() {
  const [categoryFilter, setCategoryFilter] = useState<ConnectorCategory | "All">("All");
  const [authFilter, setAuthFilter] = useState<AuthType | "All">("All");

  let filteredConnectors = connectors;
  
  if (categoryFilter !== "All") {
    filteredConnectors = filteredConnectors.filter(c => c.category === categoryFilter);
  }
  
  if (authFilter !== "All") {
    filteredConnectors = filteredConnectors.filter(c => c.authType === authFilter);
  }

  const getAuthBadgeColor = (authType: AuthType) => {
    if (authType.includes("OAuth")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (authType === "API Key") {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else {
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  const getComplexityBadgeColor = (complexity: Complexity) => {
    switch (complexity) {
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const categories: ConnectorCategory[] = Array.from(
    new Set(connectors.map((c) => c.category))
  ) as ConnectorCategory[];

  const authTypes: AuthType[] = Array.from(
    new Set(connectors.map((c) => c.authType))
  ) as AuthType[];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#06D6A0]/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            MCP Connector Directory
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            OAuth-powered MCP server connectors for agent integrations
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {connectors.length} connectors available • {connectors.filter(c => c.featured).length} featured
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/connectors/oauth-guide"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              OAuth Guide for Agents →
            </Link>
            <Link
              href="/connectors/vault"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-all"
            >
              Token Vault (Coming Soon)
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Filter Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by Category</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCategoryFilter("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === "All"
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === category
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by Auth Type</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAuthFilter("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                authFilter === "All"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              All Auth Types
            </button>
            {authTypes.map((authType) => (
              <button
                key={authType}
                onClick={() => setAuthFilter(authType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  authFilter === authType
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {authType}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnectors.map((connector) => (
            <Link
              key={connector.id}
              href={`/connectors/${connector.slug}`}
              className="block"
            >
              <Card
                className="relative overflow-hidden bg-card/30 border-white/10 hover:border-purple-500/30 transition-all group h-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{connector.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{connector.name}</CardTitle>
                        {connector.featured && (
                          <span className="text-xs text-purple-400">★ Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getAuthBadgeColor(connector.authType)}
                    >
                      {connector.authType}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getComplexityBadgeColor(connector.complexity)}
                    >
                      {connector.complexity}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {connector.description}
                  </p>
                  <div className="text-xs text-muted-foreground mb-4">
                    <span className="font-mono bg-black/40 px-2 py-1 rounded">
                      {connector.mcpServer}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:underline">
                    View setup guide →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredConnectors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No connectors found for the selected filters.
            </p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Learn OAuth for Agents
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              OAuth 2.0 enables secure, user-authorized access without exposing credentials. 
              Learn how agents can authenticate, refresh tokens, and handle OAuth flows without browsers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/connectors/oauth-guide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Read OAuth Guide →
              </Link>
              <Link
                href="/connectors/vault"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-colors"
              >
                Token Vault Concept
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

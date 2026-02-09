"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import protocolsData from "@/data/protocols.json";

interface Protocol {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  fullDescription: string;
  category: string;
  adoptionLevel: string;
  features: {
    streaming: boolean;
    auth: boolean;
    discovery: boolean;
    bidirectional: boolean;
  };
  useCases: string[];
  compatibleHosts: string[];
  relatedSkills: string[];
  codeExample: string;
  documentation: string;
  repository: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ProtocolsData {
  protocols: Protocol[];
  stats: {
    totalProtocols: number;
    mostAdopted: string;
    newestAddition: string;
    lastUpdated: string;
  };
  categories: Category[];
}

const data = protocolsData as ProtocolsData;

const adoptionLevels = [
  { id: "widespread", label: "Widespread", color: "#06D6A0" },
  { id: "growing", label: "Growing", color: "#3B82F6" },
  { id: "emerging", label: "Emerging", color: "#8B5CF6" },
  { id: "experimental", label: "Experimental", color: "#F59E0B" },
];

const comparisonProtocols = ["mcp", "a2a", "rest", "graphql", "websocket", "grpc"];

export default function ProtocolsPage() {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAdoption, setSelectedAdoption] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const filteredProtocols = useMemo(() => {
    return data.protocols.filter((protocol) => {
      if (selectedCategory && protocol.category !== selectedCategory) return false;
      if (selectedAdoption && protocol.adoptionLevel !== selectedAdoption) return false;
      return true;
    });
  }, [selectedCategory, selectedAdoption]);

  const handleProtocolClick = (protocol: Protocol) => {
    if (selectedProtocol?.id === protocol.id) {
      setSelectedProtocol(null);
    } else {
      setSelectedProtocol(protocol);
      setShowComparison(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedAdoption(null);
  };

  const getCategoryColor = (categoryId: string) => {
    return data.categories.find((c) => c.id === categoryId)?.color || "#888";
  };

  const getAdoptionColor = (adoptionId: string) => {
    return adoptionLevels.find((a) => a.id === adoptionId)?.color || "#888";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Agent Communication Protocols
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Discover which protocols to use for agent interoperability
          </p>
          
          {/* Stats Banner */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-8">
            <div className="flex items-center gap-2">
              <span className="text-[#06D6A0] font-bold text-2xl">{data.stats.totalProtocols}</span>
              <span className="text-muted-foreground">Total Protocols</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-bold text-2xl">{data.stats.mostAdopted}</span>
              <span className="text-muted-foreground">Most Adopted</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold text-2xl">{data.stats.newestAddition}</span>
              <span className="text-muted-foreground">Newest Addition</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant={showComparison ? "default" : "outline"}
              className={showComparison ? "bg-[#06D6A0] text-[#0a0a0a] hover:bg-[#06D6A0]/90" : ""}
            >
              📊 Compare Protocols
            </Button>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Comparison Table */}
      {showComparison && (
        <>
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Protocol Comparison</h2>
              <p className="text-muted-foreground">
                Side-by-side comparison of top protocols for agent communication
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <th key={protocolId} className="text-center p-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">{protocol?.icon}</span>
                            <span className="font-semibold text-sm">{protocol?.shortName}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-medium">Streaming</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4">
                          {protocol?.features.streaming ? (
                            <span className="text-[#06D6A0]">✓</span>
                          ) : (
                            <span className="text-muted-foreground">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-medium">Authentication</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4">
                          {protocol?.features.auth ? (
                            <span className="text-[#06D6A0]">✓</span>
                          ) : (
                            <span className="text-muted-foreground">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-medium">Discovery</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4">
                          {protocol?.features.discovery ? (
                            <span className="text-[#06D6A0]">✓</span>
                          ) : (
                            <span className="text-muted-foreground">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-medium">Bidirectional</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4">
                          {protocol?.features.bidirectional ? (
                            <span className="text-[#06D6A0]">✓</span>
                          ) : (
                            <span className="text-muted-foreground">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-medium">Adoption</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${getAdoptionColor(protocol?.adoptionLevel || "")}15`,
                              borderColor: getAdoptionColor(protocol?.adoptionLevel || ""),
                              color: getAdoptionColor(protocol?.adoptionLevel || ""),
                            }}
                          >
                            {adoptionLevels.find((a) => a.id === protocol?.adoptionLevel)?.label}
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Best For</td>
                    {comparisonProtocols.map((protocolId) => {
                      const protocol = data.protocols.find((p) => p.id === protocolId);
                      return (
                        <td key={protocolId} className="text-center p-4 text-xs text-muted-foreground">
                          {protocol?.useCases[0]}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator className="opacity-10" />
        </>
      )}

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filter by Category:</span>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor:
                      selectedCategory === category.id ? `${category.color}20` : "transparent",
                    borderColor: selectedCategory === category.id ? category.color : "rgba(255,255,255,0.1)",
                    color: selectedCategory === category.id ? category.color : "#888",
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Adoption Level:</span>
            <div className="flex flex-wrap gap-2">
              {adoptionLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() =>
                    setSelectedAdoption(selectedAdoption === level.id ? null : level.id)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor:
                      selectedAdoption === level.id ? `${level.color}20` : "transparent",
                    borderColor: selectedAdoption === level.id ? level.color : "rgba(255,255,255,0.1)",
                    color: selectedAdoption === level.id ? level.color : "#888",
                  }}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {(selectedCategory || selectedAdoption) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </section>

      {/* Protocol Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map((protocol) => (
            <Card
              key={protocol.id}
              className={`bg-card/30 border-white/10 hover:border-white/30 transition-all cursor-pointer ${
                selectedProtocol?.id === protocol.id ? "ring-2 ring-[#06D6A0]" : ""
              }`}
              onClick={() => handleProtocolClick(protocol)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-5xl">{protocol.icon}</span>
                  <div className="flex flex-col gap-1.5 items-end">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${getCategoryColor(protocol.category)}15`,
                        borderColor: getCategoryColor(protocol.category),
                        color: getCategoryColor(protocol.category),
                      }}
                    >
                      {data.categories.find((c) => c.id === protocol.category)?.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${getAdoptionColor(protocol.adoptionLevel)}15`,
                        borderColor: getAdoptionColor(protocol.adoptionLevel),
                        color: getAdoptionColor(protocol.adoptionLevel),
                      }}
                    >
                      {adoptionLevels.find((a) => a.id === protocol.adoptionLevel)?.label}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl">{protocol.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{protocol.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {protocol.features.streaming && (
                    <Badge variant="secondary" className="text-xs">
                      Streaming
                    </Badge>
                  )}
                  {protocol.features.auth && (
                    <Badge variant="secondary" className="text-xs">
                      Auth
                    </Badge>
                  )}
                  {protocol.features.discovery && (
                    <Badge variant="secondary" className="text-xs">
                      Discovery
                    </Badge>
                  )}
                  {protocol.features.bidirectional && (
                    <Badge variant="secondary" className="text-xs">
                      Bidirectional
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Click to {selectedProtocol?.id === protocol.id ? "collapse" : "expand"} details
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No protocols found with current filters</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Protocol Detail Panel */}
      {selectedProtocol && (
        <>
          <Separator className="opacity-10" />
          <section className="max-w-7xl mx-auto px-4 py-12">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <div className="flex items-start gap-6">
                  <span className="text-6xl">{selectedProtocol.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="text-3xl">{selectedProtocol.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProtocol(null)}
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${getCategoryColor(selectedProtocol.category)}15`,
                          borderColor: getCategoryColor(selectedProtocol.category),
                          color: getCategoryColor(selectedProtocol.category),
                        }}
                      >
                        {data.categories.find((c) => c.id === selectedProtocol.category)?.name}
                      </Badge>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${getAdoptionColor(selectedProtocol.adoptionLevel)}15`,
                          borderColor: getAdoptionColor(selectedProtocol.adoptionLevel),
                          color: getAdoptionColor(selectedProtocol.adoptionLevel),
                        }}
                      >
                        {adoptionLevels.find((a) => a.id === selectedProtocol.adoptionLevel)?.label}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">{selectedProtocol.fullDescription}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Use Cases */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Use Cases</h3>
                      <ul className="space-y-2">
                        {selectedProtocol.useCases.map((useCase, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-[#06D6A0] mt-0.5">•</span>
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Compatible Hosts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Compatible Hosts</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProtocol.compatibleHosts.map((host, index) => (
                          <Badge key={index} variant="outline">
                            {host}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Related Skills */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Related Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProtocol.relatedSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={selectedProtocol.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
                      >
                        📖 Documentation →
                      </a>
                      {selectedProtocol.repository && (
                        <a
                          href={selectedProtocol.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
                        >
                          💻 Repository →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Code Example */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Get Started</h3>
                    <div className="relative">
                      <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs">
                        <code className="text-[#06D6A0]">{selectedProtocol.codeExample}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <Separator className="opacity-10" />

      {/* Categories Legend */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Protocol Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.categories.map((category) => (
            <Card
              key={category.id}
              className="border-white/10"
              style={{
                backgroundColor: `${category.color}05`,
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-xl"
                  style={{ color: category.color }}
                >
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <div className="text-xs text-muted-foreground">
                  {data.protocols.filter((p) => p.category === category.id).length} protocols
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Missing a protocol?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;re always looking to expand our protocol directory. If you know of a protocol that
              should be listed here, let us know!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Suggest a Protocol →
              </a>
              <a
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

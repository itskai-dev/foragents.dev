"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ecosystemData from "@/data/ecosystem.json";

interface Node {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  nodes: Node[];
}

interface EcosystemData {
  center: Node;
  categories: Category[];
  stats: {
    totalIntegrations: number;
    protocolsSupported: number;
    hostsCompatible: number;
  };
}

const data = ecosystemData as EcosystemData;

export default function EcosystemPage() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleNodeClick = (node: Node, categoryId: string) => {
    setSelectedNode(node);
    setSelectedCategory(categoryId);
  };

  const handleCenterClick = () => {
    setSelectedNode(data.center);
    setSelectedCategory(null);
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

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Ecosystem Map
          </h1>
          <p className="text-xl text-foreground/80 mb-6">
            How forAgents.dev connects to the broader agent landscape
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#06D6A0] font-bold text-2xl">{data.stats.totalIntegrations}</span>
              <span className="text-muted-foreground">Total Integrations</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-bold text-2xl">{data.stats.protocolsSupported}</span>
              <span className="text-muted-foreground">Protocols Supported</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold text-2xl">{data.stats.hostsCompatible}</span>
              <span className="text-muted-foreground">Hosts Compatible</span>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Ecosystem Visualization */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ecosystem Graph */}
          <div className="lg:col-span-2">
            <div className="relative min-h-[800px] bg-card/20 border border-white/10 rounded-2xl p-8">
              {/* Center Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={handleCenterClick}
                  className="group relative flex flex-col items-center gap-3"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[#06D6A0]/20 rounded-full blur-xl scale-150 group-hover:bg-[#06D6A0]/30 transition-all" />
                  
                  {/* Center card */}
                  <div className="relative bg-gradient-to-br from-[#06D6A0]/20 to-[#06D6A0]/5 border-2 border-[#06D6A0] rounded-2xl p-6 hover:scale-105 transition-transform">
                    <div className="text-5xl mb-2">{data.center.icon}</div>
                    <div className="text-lg font-bold text-[#F8FAFC] whitespace-nowrap">
                      {data.center.name}
                    </div>
                  </div>
                </button>
              </div>

              {/* Category Nodes - Positioned in a circle */}
              {data.categories.map((category, categoryIndex) => {
                const totalCategories = data.categories.length;
                const angleStep = (2 * Math.PI) / totalCategories;
                const angle = categoryIndex * angleStep - Math.PI / 2; // Start from top
                const radius = 280; // Distance from center

                // Calculate position
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={category.id}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    {/* Category Container */}
                    <div className="flex flex-col items-center gap-3">
                      {/* Category Label */}
                      <div
                        className="px-4 py-1.5 rounded-full text-sm font-semibold border-2"
                        style={{
                          backgroundColor: `${category.color}15`,
                          borderColor: category.color,
                          color: category.color,
                        }}
                      >
                        {category.name}
                      </div>

                      {/* Nodes for this category */}
                      <div className="flex flex-col gap-2">
                        {category.nodes.map((node) => (
                          <button
                            key={node.id}
                            onClick={() => handleNodeClick(node, category.id)}
                            className="group relative bg-card/60 border border-white/10 hover:border-white/30 rounded-xl p-3 min-w-[140px] hover:scale-105 transition-all"
                            style={{
                              borderColor: selectedNode?.id === node.id ? category.color : undefined,
                            }}
                          >
                            {/* Connection line to center */}
                            <svg
                              className="absolute top-1/2 left-1/2 pointer-events-none"
                              style={{
                                transform: `translate(${-x}px, ${-y}px)`,
                                width: Math.abs(x * 2),
                                height: Math.abs(y * 2),
                                left: x > 0 ? 'auto' : 0,
                                right: x > 0 ? 0 : 'auto',
                                top: y > 0 ? 'auto' : 0,
                                bottom: y > 0 ? 0 : 'auto',
                              }}
                            >
                              <line
                                x1={x > 0 ? '100%' : '0%'}
                                y1={y > 0 ? '100%' : '0%'}
                                x2={x > 0 ? '0%' : '100%'}
                                y2={y > 0 ? '0%' : '100%'}
                                stroke={category.color}
                                strokeWidth="1"
                                opacity="0.15"
                                className="group-hover:opacity-30 transition-opacity"
                              />
                            </svg>

                            <div className="relative flex items-center gap-2">
                              <span className="text-2xl">{node.icon}</span>
                              <span className="text-sm font-medium text-[#F8FAFC]">
                                {node.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Details Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedNode ? (
                <Card className="bg-card/30 border-white/10">
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-2">
                      <span className="text-5xl">{selectedNode.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{selectedNode.name}</CardTitle>
                        {selectedCategory && (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${
                                data.categories.find((c) => c.id === selectedCategory)?.color
                              }15`,
                              borderColor: data.categories.find((c) => c.id === selectedCategory)
                                ?.color,
                              color: data.categories.find((c) => c.id === selectedCategory)?.color,
                            }}
                          >
                            {data.categories.find((c) => c.id === selectedCategory)?.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{selectedNode.description}</p>
                    <a
                      href={selectedNode.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
                    >
                      Visit {selectedNode.name} →
                    </a>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card/30 border-white/10">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🗺️</div>
                      <h3 className="text-xl font-semibold mb-2">Explore the Ecosystem</h3>
                      <p className="text-sm text-muted-foreground">
                        Click on any node to learn more about how it connects to forAgents.dev
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Category Legend */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                backgroundColor: `${category.color}10`,
                borderColor: `${category.color}40`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <div className="font-semibold text-sm" style={{ color: category.color }}>
                  {category.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {category.nodes.length} {category.nodes.length === 1 ? 'integration' : 'integrations'}
                </div>
              </div>
            </div>
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
              Want to join the ecosystem?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;re always looking to expand our integrations with new protocols, hosts, tools, and
              standards that make agents more powerful.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get in Touch →
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

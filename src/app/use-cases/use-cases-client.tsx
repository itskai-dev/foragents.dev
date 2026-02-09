"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useCasesData from "@/data/use-cases.json";

type Industry = "All" | "SaaS" | "Finance" | "Healthcare" | "E-commerce" | "DevTools";

interface Metric {
  label: string;
  value: string;
}

interface UseCase {
  id: string;
  title: string;
  industry: string;
  company: string;
  companyAvatar: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: Metric[];
  featured: boolean;
  testimonial?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
}

interface UseCasesData {
  useCases: UseCase[];
}

const data = useCasesData as UseCasesData;

export default function UseCasesClient() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>("All");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const industries: Industry[] = ["All", "SaaS", "Finance", "Healthcare", "E-commerce", "DevTools"];

  const filteredUseCases =
    selectedIndustry === "All"
      ? data.useCases
      : data.useCases.filter((useCase) => useCase.industry === selectedIndustry);

  const featuredCase = data.useCases.find((useCase) => useCase.featured);

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
            How Teams Use <span className="text-[#06D6A0]">forAgents.dev</span>
          </h1>
          <p className="text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
            Real success stories from companies transforming their operations with AI agents
          </p>

          {/* Industry Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedIndustry === industry
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Featured Case Study */}
      {featuredCase && selectedIndustry === "All" && (
        <>
          <section className="max-w-5xl mx-auto px-4 py-16">
            <div className="text-center mb-8">
              <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20 mb-3">
                Featured Story
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Success Spotlight</h2>
            </div>

            <Card className="bg-card/30 border-white/10 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Column - Story */}
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-5xl">{featuredCase.companyAvatar}</div>
                    <div>
                      <h3 className="text-2xl font-bold">{featuredCase.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{featuredCase.company}</span>
                        <Badge variant="outline" className="text-xs">
                          {featuredCase.industry}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wider">
                        Challenge
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featuredCase.challenge}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                        Solution
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featuredCase.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[#06D6A0] mb-2 uppercase tracking-wider">
                        Result
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featuredCase.result}
                      </p>
                    </div>
                  </div>

                  {featuredCase.testimonial && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <blockquote className="italic text-sm text-muted-foreground mb-3">
                        &quot;{featuredCase.testimonial}&quot;
                      </blockquote>
                      <div className="text-sm">
                        <div className="font-semibold text-foreground">
                          {featuredCase.testimonialAuthor}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {featuredCase.testimonialRole}, {featuredCase.company}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Metrics */}
                <div className="bg-gradient-to-br from-[#06D6A0]/5 to-purple/5 p-8 md:p-10 flex flex-col justify-center">
                  <h4 className="text-lg font-semibold mb-6 text-center">Key Metrics</h4>
                  <div className="space-y-6">
                    {featuredCase.metrics.map((metric, index) => (
                      <div key={index} className="text-center">
                        <div className="text-4xl font-bold text-[#06D6A0] mb-1">
                          {metric.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <Separator className="opacity-10" />
        </>
      )}

      {/* Use Cases Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">More Success Stories</h2>
          <p className="text-muted-foreground">
            See how companies across industries are achieving breakthrough results
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredUseCases
            .filter((useCase) => !useCase.featured || selectedIndustry !== "All")
            .map((useCase) => {
              const isExpanded = expandedCase === useCase.id;

              return (
                <Card
                  key={useCase.id}
                  className="bg-card/50 border-white/10 hover:border-[#06D6A0]/30 transition-all group"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-2">
                      <div className="text-4xl">{useCase.companyAvatar}</div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-[#06D6A0] transition-colors">
                          {useCase.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">{useCase.company}</span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-white/5 text-white/60 border-white/10"
                          >
                            {useCase.industry}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-white/5 rounded-lg">
                      {useCase.metrics.map((metric, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xl font-bold text-[#06D6A0]">{metric.value}</div>
                          <div className="text-[10px] text-muted-foreground leading-tight">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Challenge/Solution/Result */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 mb-1.5 uppercase tracking-wider">
                          Challenge
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {useCase.challenge}
                        </p>
                      </div>

                      {isExpanded && (
                        <>
                          <div>
                            <h4 className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
                              Solution
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {useCase.solution}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-[#06D6A0] mb-1.5 uppercase tracking-wider">
                              Result
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {useCase.result}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedCase(isExpanded ? null : useCase.id)}
                      className="mt-4 text-sm text-[#06D6A0] hover:underline font-medium"
                    >
                      {isExpanded ? "Show Less ↑" : "Read Full Story →"}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* No Results */}
        {filteredUseCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No success stories found for this industry.</p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* Stats Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Impact at a Glance</h2>
          <p className="text-muted-foreground">
            Aggregate results across all customer deployments
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-card/30 border border-white/10 rounded-xl">
            <div className="text-4xl font-bold text-[#06D6A0] mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Companies Using</div>
          </div>
          <div className="text-center p-6 bg-card/30 border border-white/10 rounded-xl">
            <div className="text-4xl font-bold text-[#06D6A0] mb-2">85%</div>
            <div className="text-sm text-muted-foreground">Avg. Time Saved</div>
          </div>
          <div className="text-center p-6 bg-card/30 border border-white/10 rounded-xl">
            <div className="text-4xl font-bold text-[#06D6A0] mb-2">10M+</div>
            <div className="text-sm text-muted-foreground">Tasks Automated</div>
          </div>
          <div className="text-center p-6 bg-card/30 border border-white/10 rounded-xl">
            <div className="text-4xl font-bold text-[#06D6A0] mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
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
              Ready to Write Your Success Story?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of companies transforming their operations with AI agents. Start building today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get Started →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyCodeButton } from "./copy-code-button";

type IntegrationCategory = "monitoring" | "storage" | "communication" | "deployment" | "security";

interface IntegrationDetail {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  type: "API" | "CLI" | "Plugin" | "Webhook";
  category: IntegrationCategory;
  learnMoreUrl: string;
  setupInstructions: string;
  steps: string[];
  codeSnippet: string;
  requiredEnvVars: string[];
  documentation: string;
  featured?: boolean;
  installCount: number;
  rating: {
    average: number;
    count: number;
  };
  configSchemaHints: {
    required: string[];
    optional: string[];
    sample: Record<string, string>;
    notes: string;
  };
  configExamples: Array<{
    title: string;
    format: "json" | "env" | "yaml";
    content: string;
  }>;
}

interface IntegrationDetailClientProps {
  slug: string;
}

function starsFromRating(average: number) {
  const safe = Math.max(0, Math.min(5, average));
  return "★".repeat(Math.round(safe)) + "☆".repeat(5 - Math.round(safe));
}

export function IntegrationDetailClient({ slug }: IntegrationDetailClientProps) {
  const [integration, setIntegration] = useState<IntegrationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIntegration() {
      try {
        setError(null);
        setIsLoading(true);

        const response = await fetch(`/api/integrations/${slug}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load integration");
        }

        const data = (await response.json()) as { integration: IntegrationDetail };
        setIntegration(data.integration);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError("Unable to load integration details.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadIntegration();

    return () => controller.abort();
  }, [slug]);

  const getTypeBadgeColor = (type: IntegrationDetail["type"]) => {
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

  const sampleConfigEntries = useMemo(() => {
    if (!integration) return [];
    return Object.entries(integration.configSchemaHints.sample);
  }, [integration]);

  async function handleInstall() {
    if (!integration) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setIsInstalling(true);

      const response = await fetch(`/api/integrations/${integration.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to install");
      }

      const data = (await response.json()) as { installCount: number };

      setIntegration((current) =>
        current
          ? {
              ...current,
              installCount: data.installCount,
            }
          : current
      );

      setSuccessMessage("Install recorded successfully.");
    } catch {
      setError("Install tracking failed. Please try again.");
    } finally {
      setIsInstalling(false);
    }
  }

  async function handleSubmitRating() {
    if (!integration || !selectedRating) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setIsSubmittingRating(true);

      const response = await fetch(`/api/integrations/${integration.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedRating }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const data = (await response.json()) as {
        rating: { average: number; count: number };
      };

      setIntegration((current) =>
        current
          ? {
              ...current,
              rating: data.rating,
            }
          : current
      );

      setSuccessMessage("Thanks! Your rating was submitted.");
      setSelectedRating(null);
    } catch {
      setError("Rating submission failed. Please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <p className="text-muted-foreground">Loading integration...</p>
      </div>
    );
  }

  if (!integration || error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? "Integration not found."}</p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            ← Back to Integrations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/integrations" className="hover:text-foreground transition-colors">
              Integrations
            </Link>
            <span>/</span>
            <span className="text-foreground">{integration.name}</span>
          </nav>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-start gap-6 mb-6">
            <span className="text-6xl">{integration.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
                  {integration.name}
                </h1>
                {integration.featured && (
                  <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30">
                    ★ Featured
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={getTypeBadgeColor(integration.type)}>
                  {integration.type}
                </Badge>
                <Badge variant="outline" className="border-white/15 text-muted-foreground">
                  {integration.category}
                </Badge>
              </div>
              <p className="text-lg text-foreground/80 mb-4">{integration.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>⬇ {integration.installCount.toLocaleString()} installs</span>
                <span>
                  ⭐ {integration.rating.average.toFixed(1)} ({integration.rating.count} ratings)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-60"
            >
              {isInstalling ? "Installing..." : "Install"}
            </button>
            <a
              href={integration.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Official Documentation ↗
            </a>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              ← Back to Integrations
            </Link>
          </div>

          {(successMessage || error) && (
            <p className={`mt-4 text-sm ${error ? "text-red-400" : "text-[#06D6A0]"}`}>
              {error ?? successMessage}
            </p>
          )}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Setup Instructions</CardTitle>
            <p className="text-muted-foreground">{integration.setupInstructions}</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {integration.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-foreground/90 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {integration.requiredEnvVars.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Required Environment Variables</CardTitle>
              <p className="text-muted-foreground">
                Set these variables in your environment to authenticate and configure the integration.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                {integration.requiredEnvVars.map((envVar) => (
                  <div key={envVar} className="py-1">
                    <span className="text-[#06D6A0]">{envVar}</span>
                    <span className="text-muted-foreground">=your_value_here</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Code Example</CardTitle>
            <p className="text-muted-foreground">
              Here's a quick example to get you started with the {integration.name} integration.
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-black/60 rounded-lg p-6 overflow-x-auto">
                <code className="text-sm font-mono text-foreground/90">{integration.codeSnippet}</code>
              </pre>
              <CopyCodeButton code={integration.codeSnippet} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Configuration Schema Hints</CardTitle>
            <p className="text-muted-foreground">Use these fields when wiring this integration into your agent config.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[#06D6A0]">Required keys</h3>
              <div className="flex flex-wrap gap-2">
                {integration.configSchemaHints.required.map((key) => (
                  <Badge key={key} variant="outline" className="border-[#06D6A0]/30 text-[#06D6A0]">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>

            {integration.configSchemaHints.optional.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Optional keys</h3>
                <div className="flex flex-wrap gap-2">
                  {integration.configSchemaHints.optional.map((key) => (
                    <Badge key={key} variant="outline" className="border-white/15 text-muted-foreground">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {sampleConfigEntries.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <h3 className="text-sm font-semibold mb-2">Sample values</h3>
                <div className="space-y-1 font-mono text-sm">
                  {sampleConfigEntries.map(([key, value]) => (
                    <p key={key}>
                      <span className="text-[#06D6A0]">{key}</span>
                      <span className="text-muted-foreground">: {value}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{integration.configSchemaHints.notes}</p>
          </CardContent>
        </Card>
      </section>

      {integration.configExamples.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Config Examples</CardTitle>
              <p className="text-muted-foreground">Drop-in examples you can adapt for your runtime.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.configExamples.map((example) => (
                <div key={example.title} className="rounded-lg border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{example.title}</p>
                    <Badge variant="outline" className="border-white/15 text-muted-foreground uppercase">
                      {example.format}
                    </Badge>
                  </div>
                  <pre className="overflow-x-auto">
                    <code className="font-mono text-sm text-foreground/90">{example.content}</code>
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Rate this integration</CardTitle>
            <p className="text-muted-foreground">Help other builders by sharing a quick rating.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                    selectedRating === star
                      ? "border-[#06D6A0]/40 bg-[#06D6A0]/20 text-[#06D6A0]"
                      : "border-white/15 text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {star}★
                </button>
              ))}
              <button
                onClick={handleSubmitRating}
                disabled={!selectedRating || isSubmittingRating}
                className="ml-2 px-4 py-1.5 rounded-md bg-[#06D6A0] text-[#0a0a0a] text-sm font-semibold disabled:opacity-60"
              >
                {isSubmittingRating ? "Submitting..." : "Submit rating"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Current rating: {integration.rating.average.toFixed(1)} / 5 ({starsFromRating(integration.rating.average)})
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={integration.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Official Documentation</p>
                <p className="text-sm text-muted-foreground">Complete API reference and guides</p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <Link
              href="/guides"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-[#06D6A0]/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">forAgents.dev Guides</p>
                <p className="text-sm text-muted-foreground">Learn how to build AI agents</p>
              </div>
              <span className="text-[#06D6A0] group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

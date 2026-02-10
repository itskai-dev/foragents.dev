/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type BrandColor = {
  id: string;
  name: string;
  hex: string;
  role: string;
};

type BrandFont = {
  label: string;
  name: string;
  family: string;
  weights: number[];
  sample: string;
};

type BrandLogo = {
  id: string;
  name: string;
  description: string;
  url: string;
  width: number;
  height: number;
  fileType: string;
  background: string;
};

type BrandAssets = {
  updatedAt: string;
  colors: BrandColor[];
  typography: {
    primary: BrandFont;
    secondary: BrandFont;
    monospace: BrandFont;
  };
  logos: BrandLogo[];
  guidelines: {
    dos: string[];
    donts: string[];
  };
};

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-5xl mx-auto px-4 py-20 space-y-4 animate-pulse">
        <div className="h-12 rounded-lg bg-white/10" />
        <div className="h-6 rounded-lg bg-white/10 w-2/3" />
        <div className="h-6 rounded-lg bg-white/10 w-1/2" />
      </section>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex items-center justify-center px-4">
      <Card className="max-w-xl w-full bg-card/60 border-red-400/30">
        <CardHeader>
          <CardTitle className="text-red-300">Couldn't load brand assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button type="button" onClick={onRetry} className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandClientPage() {
  const [data, setData] = useState<BrandAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const fetchBrandData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/brand", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unexpected server response");
      }

      const payload = (await response.json()) as BrandAssets;
      setData(payload);
    } catch {
      setError("The brand API is currently unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBrandData();
  }, []);

  const fonts = useMemo(() => {
    if (!data) return [];
    return Object.values(data.typography);
  }, [data]);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      window.setTimeout(() => setCopiedColor(null), 1400);
    } catch {
      setCopiedColor(null);
    }
  };

  const simulateDownload = (logoId: string) => {
    setDownloadingId(logoId);

    window.setTimeout(() => {
      setDownloadingId(null);
      setDownloadedIds((current) => (current.includes(logoId) ? current : [...current, logoId]));
    }, 900);
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? "Unknown error"} onRetry={fetchBrandData} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Badge variant="outline" className="mb-4 border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10">
          Live press kit data
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">Brand Guidelines</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Logos, color palette, typography, and usage guidance sourced from persistent JSON data.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="colors">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Color Swatches</h2>
          <p className="text-muted-foreground">Click copy to grab exact hex values for implementation.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.colors.map((color) => (
            <Card key={color.id} className="bg-card/50 border-white/10 overflow-hidden">
              <div className="h-28" style={{ backgroundColor: color.hex }} />
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{color.name}</h3>
                  <p className="text-xs text-muted-foreground">{color.role}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm font-mono text-[#06D6A0]">{color.hex}</code>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20"
                    onClick={() => {
                      void copyHex(color.hex);
                    }}
                  >
                    {copiedColor === color.hex ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="typography">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Typography</h2>
          <p className="text-muted-foreground">Primary, secondary, and monospace font guidance.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {fonts.map((font) => (
            <Card key={font.label} className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">{font.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{font.name}</p>
                  <p className="text-xs text-muted-foreground">Weights: {font.weights.join(", ")}</p>
                </div>
                <div
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-4"
                  style={{ fontFamily: font.family }}
                >
                  {font.sample}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="logos">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Logo Variants</h2>
          <p className="text-muted-foreground">4 standard variants with dimensions and quick download simulation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {data.logos.map((logo) => {
            const isDownloading = downloadingId === logo.id;
            const downloaded = downloadedIds.includes(logo.id);

            return (
              <Card key={logo.id} className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">{logo.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-muted-foreground">{logo.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {logo.width}×{logo.height}px · {logo.fileType} · {logo.background} background
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => simulateDownload(logo.id)}
                      disabled={isDownloading}
                      className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110"
                    >
                      {isDownloading ? "Preparing..." : downloaded ? "Download Again" : "Simulate Download"}
                    </Button>
                    <a
                      href={logo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#06D6A0] underline decoration-dotted"
                    >
                      View file URL
                    </a>
                  </div>

                  {downloaded ? <p className="text-xs text-green-400">Download ready: {logo.name}</p> : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="usage">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Usage Guidelines</h2>
          <p className="text-muted-foreground">5 do's and don'ts for consistent brand usage.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-green-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-300">Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {data.guidelines.dos.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-red-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-red-300">Don't</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {data.guidelines.donts.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0">✗</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-lg border border-white/20 px-5 py-2 text-sm hover:bg-white/5"
          >
            Press inquiries
          </Link>
          <Link
            href="https://github.com/reflectt/foragents.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg bg-[#06D6A0] px-5 py-2 text-sm text-[#0a0a0a] font-semibold hover:brightness-110"
          >
            Contribute updates
          </Link>
        </div>
      </section>
    </div>
  );
}

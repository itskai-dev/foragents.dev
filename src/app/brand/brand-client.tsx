/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type BrandCategory = "logos" | "colors" | "typography" | "icons" | "screenshots";

type BrandAsset = {
  id: string;
  name: string;
  description: string;
  category: BrandCategory;
  format: "svg" | "png" | "pdf";
  downloadUrl: string;
  usageGuidelines: string;
};

type BrandColor = {
  name: string;
  hex: string;
  usage: string;
};

type BrandFont = {
  name: string;
  role: string;
  sample: string;
  weights: number[];
};

type BrandResponse = {
  updatedAt: string;
  pressContact: {
    name: string;
    email: string;
  };
  colorPalette: BrandColor[];
  typography: BrandFont[];
  usageGuidelines: string[];
  assets: BrandAsset[];
  filters: {
    category: BrandCategory | null;
    availableCategories: BrandCategory[];
  };
};

type PressFormState = {
  name: string;
  email: string;
  description: string;
};

const CATEGORY_LABELS: Record<BrandCategory, string> = {
  logos: "Logos",
  colors: "Color Assets",
  typography: "Typography",
  icons: "Icons",
  screenshots: "Screenshots",
};

export function BrandClientPage() {
  const [data, setData] = useState<BrandResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [form, setForm] = useState<PressFormState>({ name: "", email: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/brand", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load brand assets");
        }

        const payload = (await response.json()) as BrandResponse;
        setData(payload);
      } catch {
        setError("Couldn't load the press kit right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const groupedAssets = useMemo(() => {
    if (!data) return {} as Record<BrandCategory, BrandAsset[]>;

    return data.assets.reduce(
      (acc, asset) => {
        acc[asset.category].push(asset);
        return acc;
      },
      {
        logos: [],
        colors: [],
        typography: [],
        icons: [],
        screenshots: [],
      } as Record<BrandCategory, BrandAsset[]>
    );
  }, [data]);

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1200);
    } catch {
      setCopiedHex(null);
    }
  };

  const handlePressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormMessage(null);

    try {
      const response = await fetch("/api/brand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFormError(payload.error ?? "Unable to submit request.");
        return;
      }

      setFormMessage(payload.message ?? "Request submitted.");
      setForm({ name: "", email: "", description: "" });
    } catch {
      setFormError("Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-foreground">
        <section className="max-w-5xl mx-auto px-4 py-20 space-y-4 animate-pulse">
          <div className="h-10 rounded-lg bg-white/10" />
          <div className="h-6 rounded-lg bg-white/10 w-2/3" />
          <div className="h-6 rounded-lg bg-white/10 w-1/2" />
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-foreground flex items-center justify-center px-4">
        <Card className="max-w-lg w-full bg-card/60 border-red-400/30">
          <CardHeader>
            <CardTitle className="text-red-300">Couldn't load brand kit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error ?? "Unknown error"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Badge variant="outline" className="mb-4 border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10">
          Press kit · persistent API data
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">forAgents.dev Brand Center</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Download official assets, use approved colors and type, and submit custom requests to the press team.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="assets">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Asset Library</h2>
          <p className="text-muted-foreground">Organized by category with direct download links.</p>
        </div>

        <div className="space-y-10">
          {data.filters.availableCategories.map((category) => {
            const items = groupedAssets[category];
            if (!items?.length) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold">{CATEGORY_LABELS[category]}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((asset) => (
                    <Card key={asset.id} className="bg-card/50 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between gap-3">
                          <span>{asset.name}</span>
                          <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">
                            {asset.format}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{asset.description}</p>
                        <p className="text-xs text-muted-foreground">{asset.usageGuidelines}</p>
                        <Button asChild className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110">
                          <a href={asset.downloadUrl} target="_blank" rel="noreferrer">
                            Download
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="colors">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Color Palette</h2>
          <p className="text-muted-foreground">Copy exact hex values for implementation.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.colorPalette.map((color) => (
            <Card key={color.hex} className="bg-card/50 border-white/10 overflow-hidden">
              <div className="h-24" style={{ backgroundColor: color.hex }} />
              <CardContent className="pt-4 space-y-2">
                <p className="font-medium">{color.name}</p>
                <p className="text-xs text-muted-foreground">{color.usage}</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-[#06D6A0]">{color.hex}</code>
                  <Button variant="outline" className="border-white/20" onClick={() => void handleCopyHex(color.hex)}>
                    {copiedHex === color.hex ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="typography">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Typography Samples</h2>
          <p className="text-muted-foreground">Reference approved roles and font weights.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {data.typography.map((font) => (
            <Card key={font.name} className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">{font.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Role: {font.role}</p>
                <p className="text-sm text-muted-foreground">Weights: {font.weights.join(", ")}</p>
                <p className="text-base border border-white/10 rounded-md bg-black/20 p-3">{font.sample}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-16" id="usage">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Usage Guidelines</h2>
          <p className="text-muted-foreground">Use these rules for consistent press representation.</p>
        </div>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {data.usageGuidelines.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="text-[#06D6A0] shrink-0">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-3xl mx-auto px-4 py-16" id="press-contact">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Press Contact Form</h2>
          <p className="text-muted-foreground">
            Need a custom asset? Reach {data.pressContact.name} at {data.pressContact.email} or submit below.
          </p>
        </div>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handlePressSubmit}>
              <div className="space-y-2">
                <Label htmlFor="press-name">Name</Label>
                <Input
                  id="press-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Jane Reporter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="press-email">Email</Label>
                <Input
                  id="press-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="press-description">What do you need?</Label>
                <Textarea
                  id="press-description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Need a transparent logo lockup and 4K dashboard screenshot for publication."
                  className="min-h-28"
                />
              </div>

              <Button type="submit" disabled={submitting} className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110">
                {submitting ? "Submitting..." : "Submit request"}
              </Button>

              {formMessage ? <p className="text-sm text-green-400">{formMessage}</p> : null}
              {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </section>
    </div>
  );
}

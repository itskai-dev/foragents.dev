/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type PartnerTier = "founding" | "gold" | "silver" | "community";

type Partner = {
  name: string;
  slug: string;
  website: string;
  description: string;
  logo: string;
  tier: PartnerTier;
  featured: boolean;
  joinedAt: string;
};

type PartnersResponse = {
  partners: Partner[];
  total: number;
};

type PartnerApplicationForm = {
  name: string;
  website: string;
  description: string;
  tierInterest: PartnerTier;
  contactEmail: string;
};

const initialForm: PartnerApplicationForm = {
  name: "",
  website: "",
  description: "",
  tierInterest: "community",
  contactEmail: "",
};

const tierOrder: PartnerTier[] = ["founding", "gold", "silver", "community"];

const tierLabels: Record<PartnerTier, string> = {
  founding: "Founding",
  gold: "Gold",
  silver: "Silver",
  community: "Community",
};

function getTierBadgeColor(tier: PartnerTier) {
  switch (tier) {
    case "founding":
      return "bg-purple-500/20 text-purple-300 border-purple-400/40";
    case "gold":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40";
    case "silver":
      return "bg-slate-500/20 text-slate-200 border-slate-400/40";
    case "community":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
    default:
      return "bg-white/10 text-foreground border-white/20";
  }
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tierFilter, setTierFilter] = useState<PartnerTier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState<PartnerApplicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (tierFilter !== "all") {
          params.set("tier", tierFilter);
        }

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const query = params.toString();
        const response = await fetch(`/api/partners${query ? `?${query}` : ""}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load partners");
        }

        const data = (await response.json()) as PartnersResponse;

        if (!cancelled) {
          setPartners(Array.isArray(data.partners) ? data.partners : []);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load partners right now.");
          setPartners([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, tierFilter]);

  const featuredPartners = useMemo(
    () => partners.filter((partner) => partner.featured),
    [partners]
  );

  const directoryPartners = useMemo(
    () => partners.filter((partner) => !partner.featured),
    [partners]
  );

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
        details?: string[];
      };

      if (!response.ok) {
        const details = payload.details?.join(" ");
        setSubmitError(payload.error ?? details ?? "Could not submit application.");
        return;
      }

      setSubmitMessage(payload.message ?? "Application received.");
      setForm(initialForm);
    } catch {
      setSubmitError("Could not submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const hasResults = partners.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Partner Directory
          </h1>
          <p className="text-xl text-foreground/80 mb-2">Browse ecosystem partners and apply to join.</p>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${partners.length} matching partners`}</p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl bg-card/30 border-white/10 text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTierFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tierFilter === "all"
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              All tiers
            </button>
            {tierOrder.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tierFilter === tier
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {tierLabels[tier]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading partners…</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : !hasResults ? (
          <div className="text-center py-12 text-muted-foreground">No partners found for this filter.</div>
        ) : (
          <>
            {featuredPartners.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Featured Partners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPartners.map((partner) => (
                    <Card
                      key={partner.slug}
                      className="relative overflow-hidden bg-card/40 border-[#06D6A0]/30 ring-1 ring-[#06D6A0]/20"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-md border border-white/10 bg-cover bg-center"
                              style={{ backgroundImage: `url('${partner.logo}')` }}
                              aria-label={`${partner.name} logo`}
                            />
                            <CardTitle className="text-lg">{partner.name}</CardTitle>
                          </div>
                          <Badge className="bg-[#06D6A0]/20 text-[#8af5d8] border-[#06D6A0]/30">Featured</Badge>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 pt-3">
                          <Badge variant="outline" className={getTierBadgeColor(partner.tier)}>
                            {tierLabels[partner.tier]}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-foreground/80">
                            Joined {new Date(partner.joinedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{partner.description}</p>
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <Link href={`/partners/${partner.slug}`} className="text-[#06D6A0] hover:underline">
                            View details →
                          </Link>
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:underline"
                          >
                            Website ↗
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {directoryPartners.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">All Partners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {directoryPartners.map((partner) => (
                    <Card
                      key={partner.slug}
                      className="relative overflow-hidden bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-11 w-11 rounded-md border border-white/10 bg-cover bg-center"
                            style={{ backgroundImage: `url('${partner.logo}')` }}
                            aria-label={`${partner.name} logo`}
                          />
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 pt-3">
                          <Badge variant="outline" className={getTierBadgeColor(partner.tier)}>
                            {tierLabels[partner.tier]}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-foreground/80">
                            Joined {new Date(partner.joinedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{partner.description}</p>
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <Link href={`/partners/${partner.slug}`} className="text-[#06D6A0] hover:underline">
                            View details →
                          </Link>
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:underline"
                          >
                            Website ↗
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Separator className="opacity-10" />

      <section id="apply" className="max-w-3xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Become a Partner</CardTitle>
            <p className="text-muted-foreground">Submit your application. We review every request manually.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleApply}>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Partner name"
                required
              />

              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourcompany.com"
                required
              />

              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@yourcompany.com"
                required
              />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tier interest</p>
                <div className="flex flex-wrap gap-2">
                  {tierOrder.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, tierInterest: tier }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.tierInterest === tier
                          ? "bg-[#06D6A0] text-[#0a0a0a]"
                          : "border border-white/10 text-foreground hover:bg-white/5"
                      }`}
                    >
                      {tierLabels[tier]}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us about your product, audience, and partnership goals"
                className="w-full min-h-28 rounded-md bg-background border border-input px-3 py-2 text-sm"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>

              {submitMessage && <p className="text-sm text-emerald-300">{submitMessage}</p>}
              {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

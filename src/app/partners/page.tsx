"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

type PartnerTier = "Gold" | "Silver" | "Bronze" | "Community";
type IntegrationType = "API" | "SDK" | "Plugin" | "Service";
type PartnerType = "partner" | "sponsor";

type Partner = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  tier: PartnerTier;
  integrationType: IntegrationType;
  type: PartnerType;
  website: string;
};

type PartnersResponse = {
  partners: Partner[];
  total: number;
};

type ApplyType = "partner" | "sponsor";

type ApplyForm = {
  name: string;
  company: string;
  email: string;
  type: ApplyType;
  message: string;
};

const initialForm: ApplyForm = {
  name: "",
  company: "",
  email: "",
  type: "partner",
  message: "",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tierFilter, setTierFilter] = useState<PartnerTier | "All">("All");
  const [typeFilter, setTypeFilter] = useState<IntegrationType | "All">("All");
  const [orgFilter, setOrgFilter] = useState<PartnerType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState<ApplyForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPartners() {
      try {
        setLoading(true);
        const response = await fetch("/api/partners", { cache: "no-store" });
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
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPartners();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesTier = tierFilter === "All" || partner.tier === tierFilter;
      const matchesType = typeFilter === "All" || partner.integrationType === typeFilter;
      const matchesOrg = orgFilter === "All" || partner.type === orgFilter;
      const matchesSearch =
        searchQuery === "" ||
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTier && matchesType && matchesOrg && matchesSearch;
    });
  }, [orgFilter, partners, searchQuery, tierFilter, typeFilter]);

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

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/partners/apply", {
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
        setSubmitMessage(payload.error ?? details ?? "Could not submit application.");
        return;
      }

      setSubmitMessage(payload.message ?? "Application received.");
      setForm(initialForm);
    } catch {
      setSubmitMessage("Could not submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Partners & Sponsors
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Real ecosystem data powered by /api/partners
          </p>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${partners.length} listed organizations`}
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search partners by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto bg-card/30 border-white/10 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filter by Organization</h3>
            <div className="flex flex-wrap items-center gap-2">
              {(["All", "partner", "sponsor"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setOrgFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    orgFilter === value
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "border border-white/10 text-foreground hover:bg-white/5"
                  }`}
                >
                  {value === "All" ? "All" : value === "partner" ? "Partners" : "Sponsors"}
                </button>
              ))}
            </div>
          </div>

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

      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading partners…</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card
                key={partner.id}
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
                    <Badge variant="outline" className={getTierBadgeColor(partner.tier)}>
                      {partner.tier}
                    </Badge>
                    <Badge variant="outline" className={getTypeBadgeColor(partner.integrationType)}>
                      {partner.integrationType}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-foreground/80 capitalize">
                      {partner.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{partner.description}</p>
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No partners found matching your filters.</p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      <section id="apply" className="max-w-3xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Apply to Join</CardTitle>
            <p className="text-muted-foreground">
              Submit a partner or sponsor application. This form posts to /api/partners/apply.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleApply}>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                required
              />
              <Input
                value={form.company}
                onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                required
              />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@company.com"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.type === "partner"
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "border border-white/10 text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, type: "partner" }))}
                >
                  Partner
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.type === "sponsor"
                      ? "bg-[#06D6A0] text-[#0a0a0a]"
                      : "border border-white/10 text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, type: "sponsor" }))}
                >
                  Sponsor
                </button>
              </div>
              <textarea
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your company, integration, and goals"
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

              {submitMessage && <p className="text-sm text-muted-foreground">{submitMessage}</p>}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

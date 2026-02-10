/* eslint-disable react/no-unescaped-entities */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

export type SponsorTier = {
  name: string;
  price: number;
  perks: string[];
  sponsorCount: number;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: string;
  url: string;
  logo: string;
  description: string;
  amount: number;
  since: string;
  updatedAt: string;
};

type SponsorResponse = {
  tiers: SponsorTier[];
  sponsors: Sponsor[];
  filters?: {
    tier?: string;
    search?: string;
  };
};

type Notice = {
  type: "success" | "error";
  message: string;
};

type SponsorClientProps = {
  initialTiers?: SponsorTier[];
  initialSponsors?: Sponsor[];
};

function formatTierName(name: string) {
  if (!name) return "Unknown";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

function getTierBadgeColor(tier: string) {
  switch (tier.toLowerCase()) {
    case "patron":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
    case "champion":
      return "bg-purple/20 text-purple border-purple/40";
    case "backer":
      return "bg-cyan/20 text-cyan border-cyan/40";
    case "supporter":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}

export function SponsorClient({ initialTiers = [], initialSponsors = [] }: SponsorClientProps) {
  const [loading, setLoading] = useState(initialTiers.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [tiers, setTiers] = useState<SponsorTier[]>(initialTiers);
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);

  const [selectedTierFilter, setSelectedTierFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const [name, setName] = useState("");
  const [tier, setTier] = useState(initialTiers[0]?.name ?? "");
  const [amount, setAmount] = useState(initialTiers[0] ? String(initialTiers[0].price) : "");
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");

  const tierByName = useMemo(() => {
    return new Map(tiers.map((item) => [item.name.toLowerCase(), item]));
  }, [tiers]);

  async function loadSponsorData(nextTier = selectedTierFilter, nextSearch = searchFilter) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (nextTier && nextTier !== "all") {
        params.set("tier", nextTier);
      }
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }

      const query = params.toString();
      const response = await fetch(`/api/sponsor${query ? `?${query}` : ""}`, { cache: "no-store" });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to load sponsor data (${response.status})`);
      }

      const data = (await response.json()) as SponsorResponse;
      const nextTiers = Array.isArray(data.tiers) ? data.tiers : [];
      const nextSponsors = Array.isArray(data.sponsors) ? data.sponsors : [];

      setTiers(nextTiers);
      setSponsors(nextSponsors);

      if (nextTiers.length > 0) {
        setTier((prev) => prev || nextTiers[0].name.toLowerCase());
        setAmount((prev) => prev || String(nextTiers[0].price));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load sponsor data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialTiers.length === 0) {
      void loadSponsorData();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSponsorData(selectedTierFilter, searchFilter);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedTierFilter, searchFilter]);

  function onTierChange(value: string) {
    setTier(value);
    const selectedTier = tierByName.get(value.toLowerCase());
    if (selectedTier) {
      setAmount(String(selectedTier.price));
    }
  }

  async function submitSponsor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          tier,
          amount: Number(amount),
          url,
          logo,
          description,
          since: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const details = Array.isArray(body.details) ? `: ${body.details.join(" • ")}` : "";
        throw new Error(body.error ? `${body.error}${details}` : `Failed to add sponsor (${response.status})`);
      }

      setNotice({
        type: "success",
        message: "Sponsor added successfully.",
      });
      setName("");
      setUrl("");
      setLogo("");
      setDescription("");

      await loadSponsorData(selectedTierFilter, searchFilter);
    } catch (e) {
      setNotice({
        type: "error",
        message: e instanceof Error ? e.message : "Unable to add sponsor",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const noticeClass =
    notice?.type === "success"
      ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/5"
      : "text-red-400 border-red-500/20 bg-red-500/5";

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Sponsor Tiers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the tier that matches your goals. Every contribution helps.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading sponsor tiers…</div>
        ) : error ? (
          <div className="max-w-2xl mx-auto border border-red-500/20 bg-red-500/5 rounded-lg p-4 text-sm text-red-300">
            <div>{error}</div>
            <Button variant="outline" className="mt-3 border-red-500/30" onClick={() => void loadSponsorData()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tierItem) => (
              <Card key={tierItem.name} className="border-white/10 bg-card/40 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xl text-[#F8FAFC]">{formatTierName(tierItem.name)}</CardTitle>
                    <Badge variant="outline" className={getTierBadgeColor(tierItem.name)}>
                      {tierItem.sponsorCount} sponsors
                    </Badge>
                  </div>
                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-cyan">${tierItem.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {tierItem.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-cyan shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Current Sponsors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Backers helping keep the ecosystem open and useful for agent builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <Input
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              placeholder="Search sponsors"
              className="bg-background/40 border-white/10"
            />
          </div>
          <div>
            <select
              value={selectedTierFilter}
              onChange={(event) => setSelectedTierFilter(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-background/40 px-3 py-2 text-sm"
            >
              <option value="all">All tiers</option>
              {tiers.map((tierItem) => (
                <option key={tierItem.name} value={tierItem.name.toLowerCase()}>
                  {formatTierName(tierItem.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading sponsors…</div>
        ) : error ? (
          <div className="text-center text-sm text-red-300">Unable to load current sponsors.</div>
        ) : sponsors.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No matching sponsors found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <Card key={sponsor.id} className="border-white/10 bg-card/40">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-10 h-10 rounded-md bg-white/5" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#F8FAFC] truncate">{sponsor.name}</h3>
                      <Badge variant="outline" className={`text-xs ${getTierBadgeColor(sponsor.tier)}`}>
                        {formatTierName(sponsor.tier)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    ${sponsor.amount}/mo · since {formatDate(sponsor.since)}
                  </div>
                  <p className="mt-3 text-sm text-foreground/90">{sponsor.description}</p>
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-cyan hover:underline"
                  >
                    Visit sponsor
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <Card className="border-white/10 bg-card/40">
          <CardHeader>
            <CardTitle className="text-2xl text-[#F8FAFC]">Add a Sponsor</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a new sponsor entry and persist it to the sponsor data file.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitSponsor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sponsor-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="sponsor-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sponsor name"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sponsor-tier" className="text-sm font-medium">
                    Tier
                  </label>
                  <select
                    id="sponsor-tier"
                    value={tier}
                    onChange={(event) => onTierChange(event.target.value)}
                    className="w-full rounded-md border border-white/10 bg-background/40 px-3 py-2 text-sm"
                    required
                  >
                    {tiers.map((tierItem) => (
                      <option key={tierItem.name} value={tierItem.name.toLowerCase()}>
                        {formatTierName(tierItem.name)} (${tierItem.price}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sponsor-amount" className="text-sm font-medium">
                    Monthly amount (USD)
                  </label>
                  <Input
                    id="sponsor-amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sponsor-url" className="text-sm font-medium">
                    Website URL
                  </label>
                  <Input
                    id="sponsor-url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="sponsor-logo" className="text-sm font-medium">
                  Logo URL
                </label>
                <Input
                  id="sponsor-logo"
                  value={logo}
                  onChange={(event) => setLogo(event.target.value)}
                  placeholder="https://example.com/logo.svg"
                  className="bg-background/40 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sponsor-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="sponsor-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Short sponsor description"
                  className="min-h-[100px] bg-background/40 border-white/10"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan text-black hover:bg-cyan/90 font-mono"
                disabled={submitting || loading || tiers.length === 0}
              >
                {submitting ? "Saving sponsor…" : "Save sponsor"}
              </Button>

              {notice ? <div className={`text-sm border rounded-lg p-3 ${noticeClass}`}>{notice.message}</div> : null}
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

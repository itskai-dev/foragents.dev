"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

type SponsorTier = {
  name: string;
  price: number;
  perks: string[];
  sponsorCount: number;
};

type CurrentSponsor = {
  name: string;
  tier: string;
  amount: number;
  since: string;
  message?: string;
};

type SponsorResponse = {
  tiers: SponsorTier[];
  currentSponsors: CurrentSponsor[];
};

type Notice = {
  type: "success" | "error";
  message: string;
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

export function SponsorClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [tiers, setTiers] = useState<SponsorTier[]>([]);
  const [currentSponsors, setCurrentSponsors] = useState<CurrentSponsor[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const tierByName = useMemo(() => {
    return new Map(tiers.map((item) => [item.name.toLowerCase(), item]));
  }, [tiers]);

  async function loadSponsorData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sponsor", { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to load sponsor data (${response.status})`);
      }

      const data = (await response.json()) as SponsorResponse;
      const nextTiers = Array.isArray(data.tiers) ? data.tiers : [];
      const nextSponsors = Array.isArray(data.currentSponsors) ? data.currentSponsors : [];

      setTiers(nextTiers);
      setCurrentSponsors(nextSponsors);

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
    void loadSponsorData();
  }, []);

  function onTierChange(value: string) {
    setTier(value);
    const selectedTier = tierByName.get(value.toLowerCase());
    if (selectedTier) {
      setAmount(String(selectedTier.price));
    }
  }

  async function submitPledge(event: React.FormEvent<HTMLFormElement>) {
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
          email,
          tier,
          amount: Number(amount),
          message,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const details = Array.isArray(body.details) ? `: ${body.details.join(" • ")}` : "";
        throw new Error(body.error ? `${body.error}${details}` : `Failed to submit pledge (${response.status})`);
      }

      setNotice({
        type: "success",
        message: "Pledge submitted! Thanks for supporting forAgents.dev.",
      });
      setName("");
      setEmail("");
      setMessage("");

      await loadSponsorData();
    } catch (e) {
      setNotice({
        type: "error",
        message: e instanceof Error ? e.message : "Unable to submit pledge",
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Current Sponsors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Backers helping keep the ecosystem open and useful for agent builders.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading sponsors…</div>
        ) : error ? (
          <div className="text-center text-sm text-red-300">Unable to load current sponsors.</div>
        ) : currentSponsors.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No sponsors yet. Be the first.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentSponsors.map((sponsor) => (
              <Card key={`${sponsor.name}-${sponsor.since}`} className="border-white/10 bg-card/40">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#F8FAFC]">{sponsor.name}</h3>
                    <Badge variant="outline" className={`text-xs ${getTierBadgeColor(sponsor.tier)}`}>
                      {formatTierName(sponsor.tier)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    ${sponsor.amount}/mo · since {formatDate(sponsor.since)}
                  </div>
                  {sponsor.message ? <p className="mt-3 text-sm text-foreground/90">“{sponsor.message}”</p> : null}
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
            <CardTitle className="text-2xl text-[#F8FAFC]">Become a Sponsor</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submit a pledge and we&apos;ll follow up with onboarding details.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitPledge} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sponsor-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="sponsor-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sponsor-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="sponsor-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <label htmlFor="sponsor-message" className="text-sm font-medium">
                  Message (optional)
                </label>
                <Textarea
                  id="sponsor-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us why you&apos;re sponsoring"
                  className="min-h-[100px] bg-background/40 border-white/10"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan text-black hover:bg-cyan/90 font-mono"
                disabled={submitting || loading || tiers.length === 0}
              >
                {submitting ? "Submitting pledge…" : "Submit sponsorship pledge"}
              </Button>

              {notice ? <div className={`text-sm border rounded-lg p-3 ${noticeClass}`}>{notice.message}</div> : null}
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

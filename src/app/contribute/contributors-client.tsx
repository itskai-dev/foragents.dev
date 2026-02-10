/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type GuideCategory = "skills" | "docs" | "testing" | "design" | "translations" | "community";
type GuideDifficulty = "beginner" | "intermediate" | "advanced";
type ContributionStatus = "pending" | "approved" | "merged";

type ContributionGuide = {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  estimatedTime: string;
  steps: string[];
};

type Contribution = {
  id: string;
  type: GuideCategory;
  title: string;
  description: string;
  author: string;
  status: ContributionStatus;
  url: string;
  createdAt: string;
};

type ContributeResponse = {
  guides: ContributionGuide[];
  contributions?: Contribution[];
  recentContributions?: Contribution[];
};

type FormState = {
  name: string;
  email: string;
  type: GuideCategory;
  title: string;
  description: string;
  url: string;
};

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  skills: "Skills",
  docs: "Documentation",
  testing: "Testing",
  design: "Design",
  translations: "Translations",
  community: "Community",
};

const DIFFICULTY_CLASSES: Record<GuideDifficulty, string> = {
  beginner: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  intermediate: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  advanced: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

const STATUS_CLASSES: Record<ContributionStatus, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  approved: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  merged: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

const initialForm: FormState = {
  name: "",
  email: "",
  type: "skills",
  title: "",
  description: "",
  url: "",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function ContributorsClient() {
  const [guides, setGuides] = useState<ContributionGuide[]>([]);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<"all" | GuideCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ContributionStatus>("all");
  const [searchFilter, setSearchFilter] = useState("");

  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const guidesByCategory = useMemo(() => {
    const grouped = new Map<GuideCategory, ContributionGuide[]>();

    guides.forEach((guide) => {
      const current = grouped.get(guide.category) ?? [];
      grouped.set(guide.category, [...current, guide]);
    });

    return Array.from(grouped.entries());
  }, [guides]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = new URLSearchParams();

      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchFilter.trim()) params.set("search", searchFilter.trim());

      const query = params.toString();
      const response = await fetch(`/api/contribute${query ? `?${query}` : ""}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load contribution data.");
      }

      const payload = (await response.json()) as ContributeResponse;
      setGuides(payload.guides ?? []);
      setRecentContributions(payload.contributions ?? payload.recentContributions ?? []);
    } catch {
      setLoadError("Couldn't load contribution guides right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, [searchFilter, statusFilter, typeFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          type: form.type,
          title: form.title,
          description: form.description,
          url: form.url,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string };
        throw new Error(payload.details ?? payload.error ?? "Failed to submit contribution.");
      }

      setForm(initialForm);
      setSubmitMessage("Thanks! Your contribution is now in the review queue.");
      await loadData();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Couldn't submit your contribution. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <Badge variant="outline" className="border-[#06D6A0]/40 bg-[#06D6A0]/10 text-[#06D6A0]">
          Real Contribution Workflow
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">Contribute to forAgents.dev</h1>
        <p className="mx-auto max-w-3xl text-foreground/70">
          Pick a contribution guide, follow the steps, and submit your work for review. Every submission is tracked so
          the community can see progress.
        </p>
      </section>

      {isLoading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-10 text-center text-foreground/70">Loading contribution data…</CardContent>
        </Card>
      ) : loadError ? (
        <Card className="bg-red-500/10 border-red-400/30">
          <CardContent className="py-10 text-center text-red-200">{loadError}</CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#F8FAFC]">Contribution guides</h2>
              <p className="text-foreground/70">Browse by category and choose a guide that matches your skill level.</p>
            </div>

            <div className="space-y-8">
              {guidesByCategory.map(([category, categoryGuides]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#F8FAFC]">{CATEGORY_LABELS[category]}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryGuides.map((guide) => (
                      <Card key={guide.id} className="bg-white/5 border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-[#F8FAFC] text-xl">{guide.title}</CardTitle>
                            <Badge variant="outline" className={DIFFICULTY_CLASSES[guide.difficulty]}>
                              {guide.difficulty}
                            </Badge>
                          </div>
                          <CardDescription>{guide.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-foreground/70">
                            Estimated time: <span className="text-[#F8FAFC] font-medium">{guide.estimatedTime}</span>
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
                            {guide.steps.map((step, index) => (
                              <li key={`${guide.id}-step-${index}`}>{step}</li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#F8FAFC]">Recent contributions</h2>
              <p className="text-foreground/70">Latest submissions and their current review status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contrib-type-filter">Filter by type</Label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | GuideCategory)}>
                  <SelectTrigger id="contrib-type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrib-status-filter">Filter by status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "all" | ContributionStatus)}
                >
                  <SelectTrigger id="contrib-status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="merged">Merged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrib-search-filter">Search</Label>
                <Input
                  id="contrib-search-filter"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  placeholder="Title, description, or author"
                />
              </div>
            </div>

            {recentContributions.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-8 text-center text-foreground/70">
                  No contributions found for this filter.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentContributions.map((contribution) => (
                  <Card key={contribution.id} className="bg-white/5 border-white/10">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0]">
                          {CATEGORY_LABELS[contribution.type]}
                        </Badge>
                        <Badge variant="outline" className={STATUS_CLASSES[contribution.status]}>
                          {contribution.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-[#F8FAFC] text-lg">{contribution.title}</CardTitle>
                      <CardDescription>
                        Submitted by {contribution.author} on {formatDate(contribution.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-foreground/80">{contribution.description}</p>
                      {contribution.url ? (
                        <a
                          href={contribution.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#06D6A0] hover:text-[#5EEAD4] underline underline-offset-4"
                        >
                          View submission
                        </a>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section>
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-[#F8FAFC]">Submit a contribution</CardTitle>
            <CardDescription>Share what you've built and we'll track it through review and merge.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Contribution type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as GuideCategory }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Choose a contribution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Short summary of your contribution"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Link (optional)</Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://github.com/reflectt/foragents.dev/pull/123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="What did you change and why does it help?"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? "Submitting..." : "Submit contribution"}
              </Button>

              {submitMessage && <p className="text-sm text-green-400">{submitMessage}</p>}
              {submitError && <p className="text-sm text-red-300">{submitError}</p>}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

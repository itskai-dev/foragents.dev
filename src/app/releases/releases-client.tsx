/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReleaseType = "major" | "minor" | "patch" | "security";

type Release = {
  id: string;
  version: string;
  title: string;
  description: string;
  type: ReleaseType;
  date: string;
  highlights: string[];
  tags: string[];
  updatedAt: string;
};

type ReleasesResponse = {
  releases: Release[];
  total: number;
};

const TYPE_OPTIONS: Array<{ value: "all" | ReleaseType; label: string }> = [
  { value: "all", label: "All" },
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "patch", label: "Patch" },
  { value: "security", label: "Security" },
];

function formatDate(dateValue: string): string {
  try {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateValue;
  }
}

function typeBadgeClass(type: ReleaseType): string {
  if (type === "major") return "bg-red-500/10 text-red-300 border-red-500/30";
  if (type === "minor") return "bg-blue-500/10 text-blue-300 border-blue-500/30";
  if (type === "security") return "bg-amber-500/10 text-amber-300 border-amber-500/30";

  return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReleasesClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [releases, setReleases] = useState<Release[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | ReleaseType>("all");
  const [search, setSearch] = useState("");

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("minor");
  const [date, setDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [tagsText, setTagsText] = useState("release-notes");

  const loadReleases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const query = params.toString();
      const res = await fetch(`/api/releases${query ? `?${query}` : ""}`, { cache: "no-store" });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to load releases (${res.status})`);
      }

      const payload = (await res.json()) as ReleasesResponse;
      setReleases(Array.isArray(payload.releases) ? payload.releases : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load releases");
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    void loadReleases();
  }, [loadReleases]);

  async function publishRelease(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const highlights = highlightsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const tags = tagsText
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          title,
          type,
          date,
          description,
          highlights,
          tags,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const details = Array.isArray(body.details) ? body.details.join(" • ") : "";
        throw new Error(body.error ? `${body.error}${details ? `: ${details}` : ""}` : `Publish failed (${res.status})`);
      }

      setNotice("Release published.");
      setVersion("");
      setTitle("");
      setType("minor");
      setDate(getTodayDate());
      setDescription("");
      setHighlightsText("");
      setTagsText("release-notes");
      await loadReleases();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish release");
    } finally {
      setSubmitting(false);
    }
  }

  const countLabel = useMemo(() => `${releases.length} release${releases.length === 1 ? "" : "s"}`, [releases.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl">Publish Release</CardTitle>
              <p className="text-sm text-muted-foreground">Create a release note and save it to persistent data.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={publishRelease} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      value={version}
                      onChange={(event) => setVersion(event.target.value)}
                      placeholder="e.g. 3.1.0"
                      className="bg-background/40 border-white/10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      value={type}
                      onChange={(event) => setType(event.target.value as ReleaseType)}
                      className="w-full rounded-md border border-white/10 bg-background/40 px-3 py-2 text-sm"
                    >
                      <option value="major">major</option>
                      <option value="minor">minor</option>
                      <option value="patch">patch</option>
                      <option value="security">security</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    type="date"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Release title"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-[100px] bg-background/40 border-white/10"
                    placeholder="What changed in this release?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Highlights (one per line)</label>
                  <Textarea
                    value={highlightsText}
                    onChange={(event) => setHighlightsText(event.target.value)}
                    className="min-h-[120px] bg-background/40 border-white/10"
                    placeholder={"Added release API filters\nImproved /releases metadata"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    className="bg-background/40 border-white/10"
                    placeholder="release-notes, api, search"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
                >
                  {submitting ? "Publishing…" : "Publish Release"}
                </Button>

                {error && <div className="text-sm text-red-400 border border-red-500/20 bg-red-500/5 rounded-lg p-3">{error}</div>}
                {notice && <div className="text-sm text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3">{notice}</div>}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Platform releases</h2>
              <p className="text-sm text-muted-foreground">Latest first. Search by title, description, highlights, and tags.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search releases"
                className="w-[200px] bg-background/40 border-white/10"
              />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "all" | ReleaseType)}
                className="rounded-md border border-white/10 bg-background/40 px-2.5 py-2 text-sm"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="text-sm text-muted-foreground font-mono">{countLabel}</div>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading releases…</div>
          ) : releases.length === 0 ? (
            <div className="p-6 rounded-xl border border-white/10 bg-card/20">
              <div className="text-sm text-muted-foreground">No releases found for current filters.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((release) => (
                <Card id={release.id} key={release.id} className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 font-mono">
                            v{release.version}
                          </Badge>
                          <Badge variant="outline" className={typeBadgeClass(release.type)}>
                            {release.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-white/90">{release.title}</CardTitle>
                        <div className="text-xs text-white/60 mt-1">
                          {formatDate(release.date)} • Updated {formatDate(release.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{release.description}</p>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Highlights</div>
                      <ul className="space-y-2">
                        {release.highlights.map((highlight, index) => (
                          <li key={`${release.id}-${index}`} className="text-sm text-white/80 flex items-start gap-2">
                            <span className="text-[#06D6A0] mt-1">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {release.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {release.tags.map((tag) => (
                          <Badge key={`${release.id}-${tag}`} variant="secondary" className="bg-white/5 text-white/80 border border-white/10">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 text-center text-sm text-white/50">
        <Link href="/releases/rss.xml" className="inline-flex items-center gap-2 hover:text-white transition-colors">
          <Rss className="h-4 w-4" />
          Subscribe via RSS
        </Link>
      </div>
    </div>
  );
}

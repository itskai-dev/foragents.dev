/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Industry =
  | "all"
  | "devops"
  | "customer-support"
  | "data-analysis"
  | "content-creation"
  | "security"
  | "automation";

type UseCaseMetric = {
  label: string;
  value: string;
};

type UseCaseEntry = {
  id: string;
  title: string;
  description: string;
  industry: Exclude<Industry, "all">;
  agentStack: string[];
  results: UseCaseMetric[];
  author: string;
  likes: number;
  createdAt: string;
};

type UseCasesResponse = {
  useCases: UseCaseEntry[];
  total: number;
};

const INDUSTRY_OPTIONS: Array<{ value: Industry; label: string }> = [
  { value: "all", label: "All industries" },
  { value: "devops", label: "DevOps" },
  { value: "customer-support", label: "Customer Support" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "content-creation", label: "Content Creation" },
  { value: "security", label: "Security" },
  { value: "automation", label: "Automation" },
];

function parseResults(input: string): UseCaseMetric[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      return {
        label: (label || "").trim(),
        value,
      };
    })
    .filter((metric) => metric.label.length > 0 && metric.value.length > 0);
}

export default function UseCasesClient() {
  const [useCases, setUseCases] = useState<UseCaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [industry, setIndustry] = useState<Industry>("all");
  const [search, setSearch] = useState("");
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitIndustry, setSubmitIndustry] = useState<Exclude<Industry, "all">>("devops");
  const [agentStackInput, setAgentStackInput] = useState("");
  const [resultsInput, setResultsInput] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const fetchUseCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (industry !== "all") params.set("industry", industry);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/use-cases?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Unable to load use cases (${response.status})`);
      }

      const data = (await response.json()) as UseCasesResponse;
      setUseCases(data.useCases);
    } catch {
      setError("Couldn't load use cases right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [industry, search]);

  useEffect(() => {
    void fetchUseCases();
  }, [fetchUseCases]);

  const totalLikes = useMemo(
    () => useCases.reduce((sum, useCase) => sum + useCase.likes, 0),
    [useCases]
  );

  async function handleLike(useCaseId: string) {
    setLikeLoadingId(useCaseId);

    try {
      const response = await fetch(`/api/use-cases/${useCaseId}`, {
        method: "POST",
      });

      const data = (await response.json()) as { useCase?: UseCaseEntry; error?: string };

      if (!response.ok || !data.useCase) {
        throw new Error(data.error || "Unable to like this use case");
      }

      setUseCases((current) =>
        current.map((useCase) => (useCase.id === data.useCase?.id ? data.useCase : useCase))
      );
    } catch {
      setError("Unable to register like right now.");
    } finally {
      setLikeLoadingId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const agentStack = agentStackInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const results = parseResults(resultsInput);

    if (agentStack.length === 0) {
      setSubmitMessage("Please include at least one tool in Agent Stack.");
      return;
    }

    if (results.length === 0) {
      setSubmitMessage("Please add at least one metric as label:value in Results.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/use-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          industry: submitIndustry,
          agentStack,
          results,
          author,
        }),
      });

      const data = (await response.json()) as
        | { useCase?: UseCaseEntry; error?: string; details?: string[] }
        | undefined;

      if (!response.ok || !data?.useCase) {
        const details = data?.details?.join("; ");
        throw new Error(details || data?.error || "Failed to submit use case");
      }

      setTitle("");
      setDescription("");
      setSubmitIndustry("devops");
      setAgentStackInput("");
      setResultsInput("");
      setAuthor("");
      setSubmitMessage("Use case submitted. Thanks for sharing!");
      setError(null);

      const shouldAdd =
        (industry === "all" || data.useCase.industry === industry) &&
        (!search.trim() ||
          `${data.useCase.title} ${data.useCase.description} ${data.useCase.author}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()));

      if (shouldAdd) {
        setUseCases((current) => [data.useCase as UseCaseEntry, ...current]);
      }
    } catch (err) {
      setSubmitMessage((err as Error).message || "Failed to submit use case");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Use Cases from Real Teams</h1>
        <p className="text-slate-300 max-w-3xl mx-auto">
          Discover how teams use agent workflows in production. Filter by industry, search by
          outcome, and submit your own case study.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 bg-slate-900/25 border border-white/10 rounded-2xl p-5">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Industry</p>
          <select
            value={industry}
            onChange={(event) => setIndustry(event.target.value as Industry)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2"
          >
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Search</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, author, tools, or results"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Visible use cases</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">{useCases.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Total likes</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">{totalLikes}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Industries represented</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">6</p>
        </div>
      </section>

      <section>
        {loading && (
          <div className="rounded-xl border border-white/10 bg-slate-900/20 p-6 text-slate-300">
            Loading use cases...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && useCases.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/20 p-6 text-slate-300">
            No use cases match this filter yet.
          </div>
        )}

        {!loading && !error && useCases.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {useCases.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/10 bg-slate-900/30 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[#F8FAFC]">{entry.title}</h2>
                  <span className="text-xs px-2 py-1 rounded-full border border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0]">
                    {entry.industry}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{entry.description}</p>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Agent stack</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.agentStack.map((tool) => (
                      <span
                        key={`${entry.id}-${tool}`}
                        className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Results</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {entry.results.map((metric) => (
                      <div
                        key={`${entry.id}-${metric.label}`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-[#06D6A0]">{metric.value}</p>
                        <p className="text-[11px] text-slate-400">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="text-sm text-slate-400">
                    by <span className="text-slate-200">{entry.author}</span> •{" "}
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLike(entry.id)}
                    disabled={likeLoadingId === entry.id}
                    className="rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold px-3 py-2 disabled:opacity-70"
                  >
                    {likeLoadingId === entry.id ? "Liking..." : `👍 ${entry.likes}`}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Share Your Use Case</h2>
        <p className="text-slate-400 mb-6">
          Submit your case study with your stack and measurable outcomes.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Title"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            placeholder="Description"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 resize-none"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={submitIndustry}
              onChange={(event) => setSubmitIndustry(event.target.value as Exclude<Industry, "all">)}
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
            >
              {INDUSTRY_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
              placeholder="Author"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
            />
          </div>

          <input
            value={agentStackInput}
            onChange={(event) => setAgentStackInput(event.target.value)}
            required
            placeholder="Agent stack (comma separated): openclaw, slack, github-actions"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
          />

          <textarea
            value={resultsInput}
            onChange={(event) => setResultsInput(event.target.value)}
            required
            rows={4}
            placeholder={"Results (one metric per line):\nTime saved: 42%\nMTTR: -33%"}
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 resize-none"
          />

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Use Case"}
            </button>

            {submitMessage && <p className="text-sm text-slate-300">{submitMessage}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}

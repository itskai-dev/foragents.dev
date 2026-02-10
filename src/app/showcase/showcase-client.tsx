"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ShowcaseCategory = "tools" | "integrations" | "automations" | "experiments" | "production";
type SortOption = "newest" | "popular";

type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  category: ShowcaseCategory;
  tags: string[];
  voteCount: number;
  createdAt: string;
  voters: string[];
};

type ShowcaseListResponse = {
  projects: ShowcaseProject[];
  total: number;
};

const CATEGORIES: Array<{ value: "all" | ShowcaseCategory; label: string }> = [
  { value: "all", label: "All categories" },
  { value: "tools", label: "Tools" },
  { value: "integrations", label: "Integrations" },
  { value: "automations", label: "Automations" },
  { value: "experiments", label: "Experiments" },
  { value: "production", label: "Production" },
];

const HANDLE_STORAGE_KEY = "showcase-agent-handle";

export function ShowcaseClient() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<"all" | ShowcaseCategory>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const [agentHandle, setAgentHandle] = useState("");
  const [votingProjectId, setVotingProjectId] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<ShowcaseCategory>("tools");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedHandle = window.localStorage.getItem(HANDLE_STORAGE_KEY) || "";
    setAgentHandle(savedHandle);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        params.set("sort", sort);

        const response = await fetch(`/api/showcase?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load showcase projects (${response.status})`);
        }

        const data = (await response.json()) as ShowcaseListResponse;
        setProjects(data.projects);
        setTotal(data.total);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Unable to load showcase projects right now.");
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();

    return () => controller.abort();
  }, [categoryFilter, sort]);

  const normalizedHandle = useMemo(() => agentHandle.trim().toLowerCase(), [agentHandle]);

  function hasVoted(project: ShowcaseProject): boolean {
    if (!normalizedHandle) return false;
    return project.voters.some((voter) => voter.toLowerCase() === normalizedHandle);
  }

  function updateProject(updatedProject: ShowcaseProject) {
    setProjects((current) =>
      current.map((project) => (project.id === updatedProject.id ? updatedProject : project))
    );
  }

  async function handleVote(project: ShowcaseProject) {
    if (!normalizedHandle) {
      setVoteMessage("Add your agent handle first so we can prevent duplicate votes.");
      return;
    }

    if (hasVoted(project)) return;

    setVotingProjectId(project.id);
    setVoteMessage(null);

    try {
      const response = await fetch(`/api/showcase/${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentHandle: normalizedHandle }),
      });

      const data = (await response.json()) as
        | { project?: ShowcaseProject; error?: string; duplicate?: boolean }
        | undefined;

      if (response.status === 409 || data?.duplicate) {
        if (data?.project) updateProject(data.project);
        setVoteMessage("You already voted for this project.");
        return;
      }

      if (!response.ok || !data?.project) {
        throw new Error(data?.error || "Unable to submit vote.");
      }

      updateProject(data.project);
      setVoteMessage(`Upvoted ${data.project.title}.`);
    } catch (err) {
      setVoteMessage((err as Error).message || "Unable to submit vote.");
    } finally {
      setVotingProjectId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (tags.length === 0) {
      setSubmitMessage("Please include at least one tag.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          url,
          author,
          category,
          tags,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string; details?: string[] }
          | null;
        const details = data?.details?.join("; ");
        throw new Error(details || data?.error || "Failed to submit project.");
      }

      const createdProject = (await response.json()) as ShowcaseProject;

      setTitle("");
      setDescription("");
      setUrl("");
      setAuthor("");
      setCategory("tools");
      setTagsInput("");
      setSubmitMessage("Project submitted successfully.");

      const shouldAppearInCurrentFilter =
        categoryFilter === "all" || createdProject.category === categoryFilter;

      if (shouldAppearInCurrentFilter) {
        setProjects((current) => {
          const next = [createdProject, ...current];
          if (sort === "popular") {
            return next.sort((a, b) => {
              const voteDiff = b.voteCount - a.voteCount;
              if (voteDiff !== 0) return voteDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
          }
          return next.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        setTotal((value) => value + 1);
      }
    } catch (err) {
      setSubmitMessage((err as Error).message || "Failed to submit project.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAgentHandleChange(nextValue: string) {
    setAgentHandle(nextValue);
    window.localStorage.setItem(HANDLE_STORAGE_KEY, nextValue);
  }

  return (
    <div className="space-y-10">
      <section className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Vote as an agent</h2>
            <p className="text-slate-400">
              Save your agent handle to upvote projects. Each handle can vote once per project.
            </p>
          </div>
          <label className="flex flex-col gap-2 min-w-[240px]">
            <span className="text-sm text-slate-300">Agent handle</span>
            <input
              value={agentHandle}
              onChange={(event) => handleAgentHandleChange(event.target.value)}
              placeholder="kai"
              className="px-4 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            />
          </label>
        </div>

        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Submit Project</h2>
        <p className="text-slate-400 mb-6">
          Share your project with the forAgents.dev community.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Project title"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            placeholder="Project description"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC] resize-none"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            />

            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
              placeholder="Author"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ShowcaseCategory)}
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            >
              {CATEGORIES.filter((option) => option.value !== "all").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              required
              placeholder="tags,comma,separated"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#06D6A0] text-[#0a0a0a] font-semibold rounded-lg hover:brightness-110 disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </button>

            {submitMessage && <p className="text-sm text-slate-300">{submitMessage}</p>}
          </div>
        </form>
      </section>

      <section>
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Projects ({total})</h2>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as "all" | ShowcaseCategory)}
              className="px-4 py-2 rounded-lg bg-slate-900/40 border border-white/10 text-[#F8FAFC]"
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="px-4 py-2 rounded-lg bg-slate-900/40 border border-white/10 text-[#F8FAFC]"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Upvoted</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-slate-400">Loading projects…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {voteMessage && <p className="text-slate-300 mb-4">{voteMessage}</p>}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const projectHasVote = hasVoted(project);
              const voteDisabled = !normalizedHandle || projectHasVote || votingProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-slate-900/30 border border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-[#F8FAFC]">{project.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full border border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10">
                      {project.category}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-3">{project.description}</p>

                  <p className="text-sm text-slate-400 mb-3">
                    by <span className="text-slate-200">{project.author}</span>
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={`${project.id}-${tag}`}
                        className="text-xs px-2 py-1 rounded-md bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-300">
                      <span className="font-semibold text-[#F8FAFC]">{project.voteCount}</span> votes
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg border border-white/15 text-slate-200 hover:border-white/30"
                      >
                        Visit
                      </a>
                      <button
                        type="button"
                        onClick={() => handleVote(project)}
                        disabled={voteDisabled}
                        className="px-3 py-2 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold disabled:opacity-60"
                      >
                        {projectHasVote
                          ? "Voted"
                          : votingProjectId === project.id
                            ? "Voting..."
                            : "Upvote"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    Submitted {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 text-slate-400 border border-white/10 rounded-xl bg-slate-900/20">
            No projects match your filters yet.
          </div>
        )}
      </section>
    </div>
  );
}

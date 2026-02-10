"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  screenshot?: string;
  featured: boolean;
  createdAt: string;
};

type ApiResponse = {
  projects: ShowcaseProject[];
  total: number;
};

type SortOption = "recent" | "featured";

export function ShowcaseClient() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sort, setSort] = useState<SortOption>("featured");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => tags.add(tag.toLowerCase()));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (selectedTag !== "all") params.set("tag", selectedTag);
        params.set("sort", sort);

        const response = await fetch(`/api/showcase?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load showcase projects (${response.status})`);
        }

        const data = (await response.json()) as ApiResponse;
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
  }, [search, selectedTag, sort]);

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
          tags,
          screenshot: screenshot.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string; details?: string[] }
          | null;
        const details = data?.details?.join("; ");
        const message = details || data?.error || "Failed to submit project.";
        throw new Error(message);
      }

      setTitle("");
      setDescription("");
      setUrl("");
      setAuthor("");
      setTagsInput("");
      setScreenshot("");
      setSubmitMessage("Project submitted! It now appears in the showcase.");

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedTag !== "all") params.set("tag", selectedTag);
      params.set("sort", sort);

      const refresh = await fetch(`/api/showcase?${params.toString()}`);
      if (refresh.ok) {
        const data = (await refresh.json()) as ApiResponse;
        setProjects(data.projects);
        setTotal(data.total);
      }
    } catch (err) {
      setSubmitMessage((err as Error).message || "Failed to submit project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Submit Project</h2>
        <p className="text-slate-400 mb-6">
          Share your agent project with the community. Required: title, description, url,
          author, and tags.
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
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              required
              placeholder="tags,comma,separated"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-[#F8FAFC]"
            />

            <input
              type="url"
              value={screenshot}
              onChange={(event) => setScreenshot(event.target.value)}
              placeholder="Screenshot URL (optional)"
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
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects"
              className="px-4 py-2 rounded-lg bg-slate-900/40 border border-white/10 text-[#F8FAFC]"
            />

            <select
              value={selectedTag}
              onChange={(event) => setSelectedTag(event.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-900/40 border border-white/10 text-[#F8FAFC]"
            >
              <option value="all">All tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="px-4 py-2 rounded-lg bg-slate-900/40 border border-white/10 text-[#F8FAFC]"
            >
              <option value="featured">Featured</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-slate-400">Loading projects…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-slate-900/30 border border-white/10 rounded-xl p-5 hover:border-[#06D6A0]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-[#F8FAFC]">{project.title}</h3>
                  {project.featured && (
                    <span className="text-xs px-2 py-1 rounded-full border border-yellow-500/30 text-yellow-300 bg-yellow-500/10">
                      Featured
                    </span>
                  )}
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

                <p className="text-xs text-slate-500">
                  Submitted {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </a>
            ))}
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

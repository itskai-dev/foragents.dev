"use client";

import Link from "next/link";
import { useState } from "react";

type SubmissionType = "skill" | "mcp" | "agent";

export default function SubmitPage() {
  const [type, setType] = useState<SubmissionType>("skill");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [installCmd, setInstallCmd] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          description: description.trim(),
          url: url.trim(),
          author: author.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          ...(installCmd.trim() && { install_cmd: installCmd.trim() }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setSubmissionId(data.submission?.id || "");
        // Reset form
        setName("");
        setDescription("");
        setUrl("");
        setAuthor("");
        setTags("");
        setInstallCmd("");
      } else {
        setStatus("error");
        const details = data.details ? data.details.join(", ") : data.error;
        setMessage(details);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/getting-started" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/llms.txt" className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors">/llms.txt</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          Submit to <span className="aurora-text">forAgents.dev</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Add your skill, MCP server, or agent to the directory. Submissions are reviewed before publishing.
        </p>

        {/* Success state */}
        {status === "success" && (
          <div className="p-6 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30 mb-8">
            <h2 className="text-lg font-bold text-[#06D6A0] mb-2">✅ Submission Received!</h2>
            <p className="text-sm text-muted-foreground mb-2">{message}</p>
            {submissionId && (
              <p className="text-xs font-mono text-muted-foreground">
                Submission ID: <code className="text-cyan">{submissionId}</code>
              </p>
            )}
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-cyan hover:underline"
            >
              Submit another →
            </button>
          </div>
        )}

        {/* Form */}
        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <div className="flex gap-3">
                {([
                  { value: "skill", label: "🧰 Skill", color: "border-[#F59E0B]/50 bg-[#F59E0B]/10" },
                  { value: "mcp", label: "🔌 MCP Server", color: "border-[#06D6A0]/50 bg-[#06D6A0]/10" },
                  { value: "agent", label: "🤖 Agent", color: "border-[#8B5CF6]/50 bg-[#8B5CF6]/10" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === opt.value
                        ? opt.color
                        : "border-white/10 bg-card hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Tool"
                required
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does it do? How do agents use it?"
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none"
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">URL *</label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
                required
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium mb-2">Author *</label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name or GitHub handle"
                required
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags * <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="automation, tools, github"
                required
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
              />
            </div>

            {/* Install command (optional) */}
            <div>
              <label htmlFor="install_cmd" className="block text-sm font-medium mb-2">
                Install Command <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="install_cmd"
                type="text"
                value={installCmd}
                onChange={(e) => setInstallCmd(e.target.value)}
                placeholder="npm install my-tool / npx my-tool"
                className="w-full px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors font-mono text-sm"
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                ❌ {message}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        )}

        {/* API docs for agents */}
        <div className="mt-16 p-6 rounded-lg bg-card border border-white/10">
          <h2 className="text-lg font-bold mb-3">🤖 For Agents: Use the API</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Prefer programmatic access? Submit directly via API:
          </p>
          <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono">
{`curl -X POST https://foragents.dev/api/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "skill",
    "name": "My Tool",
    "description": "What it does",
    "url": "https://github.com/...",
    "author": "me",
    "tags": ["tag1", "tag2"]
  }'`}
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            Full API docs: <Link href="/api/submit" className="text-cyan hover:underline font-mono">GET /api/submit</Link>
            {" · "}
            Review queue: <Link href="/api/submissions" className="text-cyan hover:underline font-mono">GET /api/submissions</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a href="https://reflectt.ai" target="_blank" rel="noopener noreferrer" className="aurora-text font-semibold hover:opacity-80 transition-opacity">Team Reflectt</a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">llms.txt</a>
            <a href="/api/feed.md" className="hover:text-cyan transition-colors">feed.md</a>
            <a href="https://github.com/reflectt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

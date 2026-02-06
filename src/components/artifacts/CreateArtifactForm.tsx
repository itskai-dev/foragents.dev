"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildAnnounceSnippets, artifactUrl } from "@/lib/artifactsShared";

export function CreateArtifactForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsArr = useMemo(() => {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
  }, [tags]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, author: author || undefined, tags: tagsArr }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to create artifact");
        setLoading(false);
        return;
      }

      const id = json.artifact.id as string;
      // optimistic: prebuild snippets and put on clipboard if possible
      const url = artifactUrl(id);
      const snippets = buildAnnounceSnippets({ title, url });
      try {
        await navigator.clipboard.writeText(snippets.discord);
      } catch {
        // ignore
      }

      router.push(`/artifacts/${id}`);
      router.refresh();
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/10 bg-card/40 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Create an artifact</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Bite-sized agent output. Public. Shareable. Screenshot-friendly.
          </p>
        </div>
      </div>

      <div className="grid gap-3 mt-4">
        <Input
          placeholder="Title (e.g. 'Postmortem: flaky canary runs fixed')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Body (paste your result, mini-report, prompt, etc.)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            placeholder="Author (optional, e.g. @link)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Input
            placeholder="Tags (optional, comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading} className="bg-cyan text-[#0A0E17] hover:brightness-110">
            {loading ? "Creating…" : "Publish"}
          </Button>
          <p className="text-xs text-muted-foreground font-mono">
            Tip: after publish, you can copy Discord/X/Markdown announce snippets.
          </p>
        </div>
      </div>
    </form>
  );
}

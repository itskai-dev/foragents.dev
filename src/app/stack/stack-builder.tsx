"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type StackSkill = {
  slug: string;
  name: string;
  tags: string[];
};

function normalizeListParam(raw: string[] | string | undefined) {
  if (!raw) return [];
  const s = Array.isArray(raw) ? raw.join(",") : raw;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function StackBuilder(props: {
  allSkills: StackSkill[];
  initialTitle?: string;
  initialSkills?: string[] | string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(props.initialTitle || "My Stack");
  const [filter, setFilter] = useState("");

  const initial = useMemo(() => new Set(normalizeListParam(props.initialSkills)), [props.initialSkills]);
  const [selected, setSelected] = useState<Set<string>>(initial);

  const [toast, setToast] = useState<string>("");
  const toastTimer = useRef<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }

  const selectedList = useMemo(() => Array.from(selected), [selected]);

  const cardUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("title", title || "My Stack");
    if (selectedList.length > 0) params.set("skills", selectedList.join(","));
    return `/api/stack-card?${params.toString()}`;
  }, [selectedList, title]);

  const sharePageUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("title", title || "My Stack");
    if (selectedList.length > 0) params.set("skills", selectedList.join(","));
    return `/stack?${params.toString()}`;
  }, [selectedList, title]);

  // Keep the URL in sync so the user can refresh/share.
  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace(sharePageUrl, { scroll: false });
    }, 250);
    return () => window.clearTimeout(t);
  }, [router, sharePageUrl]);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const filteredSkills = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = [...props.allSkills];
    list.sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [filter, props.allSkills]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied!");
    } catch {
      showToast("Copy failed");
    }
  }

  async function downloadPng() {
    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${(title || "my-stack").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-stack-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast("Downloaded!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Download failed");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Stack Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pick skills, preview your card, then share it anywhere.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(`${window.location.origin}${sharePageUrl}`)}
              aria-label="Copy share page link"
            >
              🔗 Share stack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(`${window.location.origin}${cardUrl}`)}
              aria-label="Copy PNG card URL"
            >
              🖼️ Copy PNG URL
            </Button>
            <Button size="sm" onClick={downloadPng} aria-label="Download stack card PNG">
              📥 Download
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-400">Title</label>
            <Input
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Stack"
            />
            <div className="text-[11px] text-slate-500 mt-2 font-mono break-all">
              og:image: <span className="text-cyan">{cardUrl}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Filter skills</label>
            <Input
              className="mt-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="search by name, slug, tag…"
            />
            <div className="text-xs text-slate-500 mt-2">
              Selected: <span className="text-slate-200 font-mono">{selectedList.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold text-white">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredSkills.map((s) => {
              const isOn = selected.has(s.slug);
              return (
                <button
                  key={s.slug}
                  onClick={() => toggle(s.slug)}
                  className={
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors " +
                    (isOn
                      ? "bg-gradient-to-r from-cyan/25 to-purple/20 border-cyan/30 text-white"
                      : "bg-black/20 border-white/10 text-slate-300 hover:bg-white/5")
                  }
                  aria-pressed={isOn}
                  title={s.slug}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-white">Preview</h2>
            <a
              className="text-xs font-mono text-cyan hover:underline"
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PNG →
            </a>
          </div>
          <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardUrl} alt="Stack card preview" className="w-full h-auto" />
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            Tip: Share the <span className="font-mono text-slate-300">/stack</span> link for rich previews (it sets og:image to your PNG).
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

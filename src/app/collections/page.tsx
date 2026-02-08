"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOwnerHandle } from "@/components/collections/useOwnerHandle";

type CollectionRow = {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  slug: string;
  itemCount: number;
  updatedAt: string;
};

export default function CollectionsPage() {
  const { ownerHandle, setOwnerHandle, ready } = useOwnerHandle();
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  async function load() {
    if (!ownerHandle) {
      setCollections([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/collections?ownerHandle=${encodeURIComponent(ownerHandle)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setCollections(data.collections || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ownerHandle]);

  async function createCollection() {
    setError("");
    if (!ownerHandle) {
      setError("Enter your handle to create a collection.");
      return;
    }
    if (!newName.trim()) {
      setError("Collection name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerHandle, name: newName.trim(), description: newDesc.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      setNewName("");
      setNewDesc("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text">⚡ Agent Hub</Link>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </div>
          <MobileNav />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save agents and artifacts for later, or share a public list.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="text-xs text-slate-400">Your handle (MVP auth)</label>
            <Input
              className="mt-2"
              value={ownerHandle}
              onChange={(e) => setOwnerHandle(e.target.value)}
              placeholder="@name@domain"
            />
            <p className="text-xs text-slate-500 mt-2">
              This is stored locally in your browser and used to scope your collections.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold text-white">New collection</h2>
              <Button size="sm" onClick={createCollection} disabled={loading}>
                Create
              </Button>
            </div>
            <div className="grid gap-2 mt-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={3} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold text-white">My collections</h2>
            {loading ? (
              <div className="text-sm text-slate-400 mt-3">Loading…</div>
            ) : ownerHandle && collections.length === 0 ? (
              <div className="text-sm text-slate-400 mt-3">No collections yet.</div>
            ) : !ownerHandle ? (
              <div className="text-sm text-slate-400 mt-3">Enter your handle to view your collections.</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections/${c.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-3 hover:bg-white/5"
                  >
                    <div>
                      <div className="text-white font-medium">{c.name}</div>
                      <div className="text-xs text-slate-400">
                        {c.itemCount} items • {c.visibility}
                        {c.visibility === "public" ? ` • /c/${c.slug}` : ""}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">View →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

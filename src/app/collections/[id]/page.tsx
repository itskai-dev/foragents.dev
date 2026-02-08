"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOwnerHandle } from "@/components/collections/useOwnerHandle";

type Item =
  | {
      id: string;
      itemType: "agent";
      addedAt: string;
      agentHandle: string;
      agent: null | { name: string; handle: string; avatar: string; profileUrl: string; description: string };
    }
  | {
      id: string;
      itemType: "artifact";
      addedAt: string;
      artifactId: string;
      artifact: null | { id: string; title: string; summary: string | null; url: string };
    };

type Collection = {
  id: string;
  ownerHandle: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  slug: string;
};

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { ownerHandle, setOwnerHandle, ready } = useOwnerHandle();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const publicUrl = useMemo(() => {
    if (!collection) return "";
    return `${window?.location?.origin || ""}/c/${collection.slug}`;
  }, [collection]);

  async function load() {
    if (!ownerHandle) {
      setCollection(null);
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/collections/${id}?ownerHandle=${encodeURIComponent(ownerHandle)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setCollection(data.collection);
      setItems(data.items || []);
      setEditName(data.collection?.name || "");
      setEditDesc(data.collection?.description || "");
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
  }, [ready, ownerHandle, id]);

  async function patchCollection(patch: Partial<Pick<Collection, "name" | "description" | "visibility" | "slug">>) {
    if (!ownerHandle) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/collections/${id}?ownerHandle=${encodeURIComponent(ownerHandle)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      setCollection(data.collection);
      setToast("Saved.");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: string) {
    if (!ownerHandle) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/collections/${id}/items/${itemId}?ownerHandle=${encodeURIComponent(ownerHandle)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      setToast("Removed.");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCollection() {
    if (!ownerHandle) return;
    if (!confirm("Delete this collection? This cannot be undone.")) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/collections/${id}?ownerHandle=${encodeURIComponent(ownerHandle)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      router.push("/collections");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!collection || collection.visibility !== "public") return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setToast("Copied link.");
      setTimeout(() => setToast(""), 2000);
    } catch {
      setToast("Copy failed.");
      setTimeout(() => setToast(""), 2000);
    }
  }

  async function downloadCard() {
    if (!collection || collection.visibility !== "public") return;
    try {
      const cardUrl = `${window?.location?.origin || ""}/api/og/stack/${collection.id}`;
      const response = await fetch(cardUrl);
      if (!response.ok) throw new Error("Failed to generate card");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collection.slug || collection.id}-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setToast("Card downloaded!");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Download failed");
      setTimeout(() => setToast(""), 3000);
    }
  }

  async function copyShareLink() {
    if (!collection || collection.visibility !== "public") return;
    try {
      const shareUrl = `${publicUrl}?ref=stack-card&utm_source=share&utm_medium=card`;
      await navigator.clipboard.writeText(shareUrl);
      setToast("Share link copied!");
      setTimeout(() => setToast(""), 2000);
    } catch {
      setToast("Copy failed.");
      setTimeout(() => setToast(""), 2000);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href="/collections" className="text-sm text-cyan hover:underline">
              ← Back to collections
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{collection?.name || "Collection"}</h1>
            {collection?.description ? (
              <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
            ) : null}
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
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/collections">Switch collection</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteCollection} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>

          {toast && <div className="text-sm text-green-400">{toast}</div>}
          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-semibold text-white">Settings</h2>
              {collection && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={collection.visibility === "public" ? "default" : "outline"}
                    onClick={() => patchCollection({ visibility: collection.visibility === "public" ? "private" : "public" })}
                    disabled={loading}
                  >
                    {collection.visibility === "public" ? "Public" : "Private"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyLink} disabled={collection.visibility !== "public"}>
                    Copy link
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadCard} disabled={collection.visibility !== "public" || loading}>
                    📥 Download Card
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyShareLink} disabled={collection.visibility !== "public"}>
                    🔗 Copy Share Link
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-2 mt-4">
              <label className="text-xs text-slate-400">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              <label className="text-xs text-slate-400 mt-2">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />

              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-slate-400">Slug (share URL)</label>
                  <Input
                    value={collection?.slug || ""}
                    onChange={(e) => setCollection((prev) => (prev ? { ...prev, slug: e.target.value } : prev))}
                    placeholder="my-stack"
                    disabled={!collection}
                  />
                </div>
                <div className="text-xs text-slate-500 flex items-end">
                  Public page: <span className="font-mono ml-2">/c/{collection?.slug || ""}</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={() => patchCollection({ name: editName, description: editDesc, slug: collection?.slug })}
                  disabled={loading || !collection}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold text-white">Items</h2>
            {loading && !collection ? (
              <div className="text-sm text-slate-400 mt-3">Loading…</div>
            ) : !ownerHandle ? (
              <div className="text-sm text-slate-400 mt-3">Enter your handle to view items.</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-slate-400 mt-3">Nothing saved yet.</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/10 p-3">
                    <div className="min-w-0">
                      {it.itemType === "agent" ? (
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{it.agent?.avatar || "🤖"}</div>
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">
                              {it.agent?.name || it.agentHandle}
                            </div>
                            <div className="text-xs text-slate-400 font-mono truncate">{it.agent?.handle || it.agentHandle}</div>
                            {it.agent?.profileUrl && (
                              <Link className="text-xs text-cyan hover:underline" href={it.agent.profileUrl}>
                                View agent →
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">
                            {it.artifact?.title || it.artifactId}
                          </div>
                          {it.artifact?.url && (
                            <Link className="text-xs text-cyan hover:underline" href={it.artifact.url}>
                              View artifact →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeItem(it.id)} disabled={loading}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

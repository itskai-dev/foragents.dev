"use client";

import { useEffect, useMemo, useState } from "react";
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
};

type Props =
  | { itemType: "agent"; agentHandle: string; label?: string }
  | { itemType: "artifact"; artifactId: string; label?: string };

export function SaveToCollectionButton(props: Props) {
  const { ownerHandle, setOwnerHandle, ready } = useOwnerHandle();
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const canSave = useMemo(() => !!selectedId && !loading, [selectedId, loading]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");

    async function load() {
      if (!ownerHandle) {
        setCollections([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/collections?ownerHandle=${encodeURIComponent(ownerHandle)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setCollections(data.collections || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load collections");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [open, ownerHandle]);

  async function handleCreateAndAdd() {
    setError("");
    setSuccess("");

    if (!ownerHandle) {
      setError("Enter your handle to create a collection.");
      return;
    }

    const name = createName.trim();
    if (!name) {
      setError("Collection name is required.");
      return;
    }

    setLoading(true);
    try {
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerHandle, name, description: createDesc.trim() || undefined }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData?.error || "Failed to create");
      const newCol: CollectionRow = {
        id: createData.collection.id,
        name: createData.collection.name,
        description: createData.collection.description,
        visibility: createData.collection.visibility,
        slug: createData.collection.slug,
        itemCount: 0,
      };
      setCollections((prev) => [newCol, ...prev]);
      setSelectedId(newCol.id);
      setCreateName("");
      setCreateDesc("");

      await handleAddToCollection(newCol.id, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCollection(collectionId?: string, keepOpen?: boolean) {
    const targetId = collectionId || selectedId;
    if (!targetId) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = { itemType: props.itemType };
      if (props.itemType === "agent") body.agentHandle = props.agentHandle;
      if (props.itemType === "artifact") body.artifactId = props.artifactId;

      const res = await fetch(`/api/collections/${targetId}/items?ownerHandle=${encodeURIComponent(ownerHandle)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");

      const colName = collections.find((c) => c.id === targetId)?.name || "collection";
      setSuccess(`Saved to ${colName}.`);
      setTimeout(() => setSuccess(""), 2000);

      if (!keepOpen) {
        setOpen(false);
        setSelectedId("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!ready}
        aria-label="Save to collection"
      >
        {props.label || "Save"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-slate-950 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Save to collection</h2>
                <p className="text-xs text-slate-400 mt-1">
                  MVP auth: enter your agent handle (e.g. @kai@reflectt.ai).
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-400">Your handle</label>
                <Input
                  value={ownerHandle}
                  onChange={(e) => setOwnerHandle(e.target.value)}
                  placeholder="@name@domain"
                  className="mt-1"
                />
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
              {success && <div className="text-sm text-green-400">{success}</div>}

              <div>
                <div className="text-sm font-medium text-white mb-2">Choose a collection</div>
                {loading && collections.length === 0 ? (
                  <div className="text-sm text-slate-400">Loading…</div>
                ) : collections.length === 0 ? (
                  <div className="text-sm text-slate-400">No collections yet. Create one below.</div>
                ) : (
                  <div className="max-h-48 overflow-auto rounded-lg border border-white/10">
                    {collections.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="collection"
                            checked={selectedId === c.id}
                            onChange={() => setSelectedId(c.id)}
                          />
                          <div>
                            <div className="text-sm text-white">{c.name}</div>
                            <div className="text-xs text-slate-400">
                              {c.itemCount} items • {c.visibility}
                            </div>
                          </div>
                        </div>
                        {c.visibility === "public" && (
                          <span className="text-xs text-cyan-400 font-mono">/c/{c.slug}</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddToCollection()} disabled={!canSave}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-sm font-medium text-white mb-2">+ New collection</div>
                <div className="grid gap-2">
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Collection name"
                  />
                  <Textarea
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCreateAndAdd} disabled={loading}>
                      Create & add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

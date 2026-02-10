/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type BookmarkItemType = "skill" | "mcp" | "collection" | "guide" | "connector";

type Bookmark = {
  id: string;
  userId: string;
  itemType: BookmarkItemType;
  itemSlug: string;
  itemName: string;
  note?: string;
  createdAt: string;
  tags: string[];
};

type AddBookmarkForm = {
  userId: string;
  itemType: BookmarkItemType;
  itemSlug: string;
  itemName: string;
  note: string;
  tags: string;
};

const ITEM_TYPES: Array<{ value: BookmarkItemType; label: string }> = [
  { value: "skill", label: "Skill" },
  { value: "mcp", label: "MCP" },
  { value: "collection", label: "Collection" },
  { value: "guide", label: "Guide" },
  { value: "connector", label: "Connector" },
];

const badgeClassByType: Record<BookmarkItemType, string> = {
  skill: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30",
  mcp: "bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30",
  collection: "bg-[#E879F9]/10 text-[#F5D0FE] border-[#E879F9]/30",
  guide: "bg-[#0EA5E9]/10 text-[#67E8F9] border-[#0EA5E9]/30",
  connector: "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
};

const routeSegmentByType: Record<BookmarkItemType, string> = {
  skill: "skills",
  mcp: "mcp",
  collection: "collections",
  guide: "guides",
  connector: "connectors",
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | BookmarkItemType>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<AddBookmarkForm>({
    userId: "user_demo",
    itemType: "skill",
    itemSlug: "",
    itemName: "",
    note: "",
    tags: "",
  });

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = new URLSearchParams();
      if (typeFilter !== "all") query.set("type", typeFilter);
      if (tagFilter !== "all") query.set("tag", tagFilter);
      if (search.trim()) query.set("search", search.trim());

      const response = await fetch(`/api/bookmarks${query.toString() ? `?${query.toString()}` : ""}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to load bookmarks");
      }

      const data = (await response.json()) as { bookmarks?: Bookmark[]; tags?: string[] };
      setBookmarks(Array.isArray(data.bookmarks) ? data.bookmarks : []);
      setAvailableTags(Array.isArray(data.tags) ? data.tags : []);
    } catch (error) {
      console.error("Failed to load bookmarks", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load bookmarks");
      setBookmarks([]);
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, tagFilter, typeFilter]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const groupedBookmarks = useMemo(() => {
    const groups: Record<BookmarkItemType, Bookmark[]> = {
      skill: [],
      mcp: [],
      collection: [],
      guide: [],
      connector: [],
    };

    for (const bookmark of bookmarks) {
      groups[bookmark.itemType].push(bookmark);
    }

    for (const type of Object.keys(groups) as BookmarkItemType[]) {
      groups[type].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return groups;
  }, [bookmarks]);

  async function removeBookmark(id: string) {
    setRemovingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to remove bookmark");
      }

      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove bookmark");
    } finally {
      setRemovingId(null);
    }
  }

  async function addBookmark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          itemType: form.itemType,
          itemSlug: form.itemSlug,
          itemName: form.itemName,
          note: form.note,
          tags,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to add bookmark");
      }

      setForm((current) => ({
        ...current,
        itemSlug: "",
        itemName: "",
        note: "",
        tags: "",
      }));

      await loadBookmarks();
    } catch (error) {
      console.error("Failed to add bookmark", error);
      setFormError(error instanceof Error ? error.message : "Failed to add bookmark");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔖 Saved Bookmarks
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Persistent favorites for skills, MCPs, collections, guides, and connectors.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Filters</CardTitle>
            <CardDescription>Filter by type, tag chips, and search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_1fr] items-end">
              <div className="space-y-2">
                <Label htmlFor="typeFilter">Type</Label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as "all" | BookmarkItemType)}
                  className="h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm"
                >
                  <option value="all">All types</option>
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, slug, note, or tag"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-black/30 border-white/15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tag Filters</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={tagFilter === "all" ? "default" : "outline"}
                  className={tagFilter === "all" ? "bg-[#06D6A0] text-black hover:brightness-110" : ""}
                  onClick={() => setTagFilter("all")}
                >
                  All tags
                </Button>
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={tagFilter === tag ? "default" : "outline"}
                    className={tagFilter === tag ? "bg-[#06D6A0] text-black hover:brightness-110" : ""}
                    onClick={() => setTagFilter(tag)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Add Bookmark</CardTitle>
            <CardDescription>Save a new favorite with tags and an optional note.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addBookmark} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newUserId">User ID</Label>
                <Input
                  id="newUserId"
                  value={form.userId}
                  onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                  placeholder="user_demo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemType">Item Type</Label>
                <select
                  id="newItemType"
                  value={form.itemType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, itemType: event.target.value as BookmarkItemType }))
                  }
                  className="h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemSlug">Item Slug</Label>
                <Input
                  id="newItemSlug"
                  value={form.itemSlug}
                  onChange={(event) => setForm((current) => ({ ...current, itemSlug: event.target.value }))}
                  placeholder="filesystem-memory"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemName">Item Name</Label>
                <Input
                  id="newItemName"
                  value={form.itemName}
                  onChange={(event) => setForm((current) => ({ ...current, itemName: event.target.value }))}
                  placeholder="Filesystem Memory Skill"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newTags">Tags (comma-separated)</Label>
                <Input
                  id="newTags"
                  value={form.tags}
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="memory, core"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newNote">Add Note (optional)</Label>
                <Input
                  id="newNote"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Why this favorite is useful"
                />
              </div>

              {formError && <p className="md:col-span-2 text-sm text-red-400">{formError}</p>}

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#06D6A0] text-black hover:brightness-110"
                >
                  {isSubmitting ? "Adding..." : "Save Bookmark"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Bookmarked Items</h2>
            <p className="text-sm text-muted-foreground">{bookmarks.length} total</p>
          </div>

          {isLoading ? (
            <Card className="bg-card/30 border-white/10">
              <CardContent className="py-14 text-center text-muted-foreground">Loading bookmarks...</CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="bg-red-950/20 border-red-500/30">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-red-300">{errorMessage}</p>
                <Button variant="outline" onClick={loadBookmarks}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : bookmarks.length === 0 ? (
            <Card className="bg-card/30 border-white/10">
              <CardContent className="py-14 text-center space-y-4">
                <div className="text-5xl">🗂️</div>
                <h3 className="text-xl font-semibold">No bookmarks found</h3>
                <p className="text-muted-foreground">Try a different filter, or add your first bookmark above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {ITEM_TYPES.map((type) => {
                const items = groupedBookmarks[type.value];
                if (!items.length) return null;

                return (
                  <div key={type.value} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{type.label}</h3>
                      <Badge className={badgeClassByType[type.value]}>{items.length}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {items.map((bookmark) => (
                        <Card key={bookmark.id} className="bg-card/40 border-white/10">
                          <CardHeader className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <CardTitle className="text-lg leading-tight">{bookmark.itemName}</CardTitle>
                                <CardDescription className="mt-1">/{bookmark.itemSlug}</CardDescription>
                              </div>
                              <Badge className={badgeClassByType[bookmark.itemType]}>{bookmark.itemType}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {bookmark.note ? (
                              <p className="text-sm text-muted-foreground">📝 {bookmark.note}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No note added.</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {bookmark.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Saved: {new Date(bookmark.createdAt).toLocaleString()}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/${routeSegmentByType[bookmark.itemType]}/${bookmark.itemSlug}`}
                                className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#06D6A0] text-black text-sm font-medium hover:brightness-110"
                              >
                                Open Item
                              </Link>
                              <Button
                                variant="outline"
                                onClick={() => removeBookmark(bookmark.id)}
                                disabled={removingId === bookmark.id}
                                className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                              >
                                {removingId === bookmark.id ? "Removing..." : "Remove"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

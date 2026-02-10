"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Category = "api" | "sdk" | "tools" | "examples";
type Difficulty = "beginner" | "intermediate" | "advanced";

type DeveloperPortalEntry = {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  updatedAt: string;
};

type ApiResponse = {
  entries: DeveloperPortalEntry[];
};

const CATEGORIES: Category[] = ["api", "sdk", "tools", "examples"];
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

const labelize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function DeveloperPortalClient() {
  const [entries, setEntries] = useState<DeveloperPortalEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("api");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [tags, setTags] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/developer-portal?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load developer portal entries");
      }

      const data = (await response.json()) as ApiResponse;
      setEntries(data.entries);
    } catch {
      setError("Unable to load developer portal resources right now.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const groupedEntries = useMemo(() => {
    const groups: Record<Category, DeveloperPortalEntry[]> = {
      api: [],
      sdk: [],
      tools: [],
      examples: [],
    };

    for (const entry of entries) {
      groups[entry.category].push(entry);
    }

    return groups;
  }, [entries]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/developer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          tags,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        details?: string[];
      };

      if (!response.ok) {
        throw new Error(payload.details?.join(". ") || payload.error || "Failed to create entry");
      }

      setTitle("");
      setDescription("");
      setCategory("api");
      setDifficulty("beginner");
      setTags("");
      setSubmitMessage("Entry created successfully.");

      await fetchEntries();
    } catch (submitError) {
      if (submitError instanceof Error) {
        setSubmitMessage(submitError.message);
      } else {
        setSubmitMessage("Failed to submit resource.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Developer Portal</h1>
        <p className="mt-3 text-muted-foreground">
          Persistent developer resources from the forAgents ecosystem. Filter by category, search by
          topic, and submit new entries to the portal.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {CATEGORIES.map((resourceCategory) => (
                  <SelectItem key={resourceCategory} value={resourceCategory}>
                    {labelize(resourceCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search title, description, difficulty, or tags"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading entries...
        </div>
      )}

      {!loading && error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="py-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {CATEGORIES.map((resourceCategory) => {
            const items = groupedEntries[resourceCategory];
            if (items.length === 0) return null;

            return (
              <section key={resourceCategory}>
                <h2 className="mb-4 text-2xl font-semibold">{labelize(resourceCategory)}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((entry) => (
                    <Card key={entry.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">{entry.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{labelize(entry.difficulty)}</Badge>
                          {entry.tags.map((tag) => (
                            <Badge key={`${entry.id}_${tag}`} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                          <Badge variant="outline">
                            Updated {new Date(entry.updatedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}

          {entries.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No resources found for the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Separator className="my-10" />

      <Card>
        <CardHeader>
          <CardTitle>Add Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="entry-title">Title</Label>
              <Input
                id="entry-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Resource title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-description">Description</Label>
              <Textarea
                id="entry-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this helps developers do"
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entry-category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                  <SelectTrigger id="entry-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((resourceCategory) => (
                      <SelectItem key={resourceCategory} value={resourceCategory}>
                        {labelize(resourceCategory)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as Difficulty)}
                >
                  <SelectTrigger id="entry-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {labelize(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-tags">Tags</Label>
              <Input
                id="entry-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="comma,separated,tags"
                required
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Create Entry"}
            </Button>

            {submitMessage && <p className="text-sm text-muted-foreground">{submitMessage}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

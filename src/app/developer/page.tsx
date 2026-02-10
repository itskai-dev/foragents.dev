/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Star } from "lucide-react";
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

type ResourceType = "sdk" | "library" | "example" | "tutorial" | "tool";

interface DeveloperResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
  language: string;
  stars: number;
  updatedAt: string;
}

interface ApiResponse {
  resources: DeveloperResource[];
}

const RESOURCE_TYPES: ResourceType[] = ["sdk", "library", "example", "tutorial", "tool"];

const formatTypeLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

export default function DeveloperPage() {
  const [resources, setResources] = useState<DeveloperResource[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>("sdk");
  const [description, setDescription] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/developer?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load resources");
      }

      const data = (await response.json()) as ApiResponse;
      setResources(data.resources);
    } catch {
      setError("Unable to load developer resources right now.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const groupedResources = useMemo(() => {
    const groups: Record<ResourceType, DeveloperResource[]> = {
      sdk: [],
      library: [],
      example: [],
      tutorial: [],
      tool: [],
    };

    for (const resource of resources) {
      groups[resource.type].push(resource);
    }

    return groups;
  }, [resources]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/developer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          type,
          description,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit resource");
      }

      setTitle("");
      setUrl("");
      setType("sdk");
      setDescription("");
      setSubmitMessage("Resource submitted successfully.");
      await fetchResources();
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
        <h1 className="text-4xl font-bold tracking-tight">Developer Resources</h1>
        <p className="mt-3 text-muted-foreground">
          Browse SDKs, libraries, tutorials, tools, and examples shared by the forAgents community.
          Here's what's new and useful for your next build.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {RESOURCE_TYPES.map((resourceType) => (
                  <SelectItem key={resourceType} value={resourceType}>
                    {formatTypeLabel(resourceType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search title, description, or language"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading resources...
        </div>
      )}

      {!loading && error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="py-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {RESOURCE_TYPES.map((resourceType) => {
            const items = groupedResources[resourceType];
            if (items.length === 0) return null;

            return (
              <section key={resourceType}>
                <h2 className="mb-4 text-2xl font-semibold">{formatTypeLabel(resourceType)}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((resource) => (
                    <Card key={resource.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-lg">
                          <span>{resource.title}</span>
                          <Button asChild variant="ghost" size="icon">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${resource.title}`}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">{resource.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{resource.language}</Badge>
                          <Badge variant="outline" className="inline-flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {resource.stars.toLocaleString()}
                          </Badge>
                          <Badge variant="outline">Updated {new Date(resource.updatedAt).toLocaleDateString()}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}

          {resources.length === 0 && (
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
          <CardTitle>Submit Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Resource name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-url">URL</Label>
              <Input
                id="resource-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/resource"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as ResourceType)}>
                <SelectTrigger id="resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((resourceType) => (
                    <SelectItem key={resourceType} value={resourceType}>
                      {formatTypeLabel(resourceType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell developers what this resource is useful for"
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Resource"}
            </Button>

            {submitMessage && (
              <p className="text-sm text-muted-foreground">{submitMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

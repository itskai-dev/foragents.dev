/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { parseStepsFromText, type Workflow } from "@/lib/workflows";

async function fetchWorkflows(search: string): Promise<Workflow[]> {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`/api/workflows?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load workflows");
  }

  const payload = await response.json() as { workflows: Workflow[] };
  return payload.workflows;
}

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stepsText, setStepsText] = useState("Research\nDraft\nReview\nPublish");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);

    try {
      const items = await fetchWorkflows(term);
      setWorkflows(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [load, search]);

  const enabledCount = useMemo(
    () => workflows.filter((workflow) => workflow.enabled).length,
    [workflows],
  );

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          steps: parseStepsFromText(stepsText),
        }),
      });

      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "Failed to create workflow");
      }

      setName("");
      setDescription("");
      setStepsText("Research\nDraft\nReview\nPublish");
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEnabled = async (workflow: Workflow) => {
    setBusyId(workflow.id);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !workflow.enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workflow");
      }

      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workflow");
    } finally {
      setBusyId(null);
    }
  };

  const removeWorkflow = async (id: string) => {
    setBusyId(id);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workflow");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#F8FAFC]">Workflow Builder</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and manage reusable workflows with API-backed persistence.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-white/5 border-white/10">{workflows.length} total</Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/20">
            {enabledCount} enabled
          </Badge>
          <Badge variant="outline" className="bg-white/5 border-white/10">
            {Math.max(workflows.length - enabledCount, 0)} disabled
          </Badge>
        </div>

        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create workflow
            </CardTitle>
            <CardDescription>Name, description, and one step per line.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Incident triage" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Route, score, and assign incoming alerts"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="steps">Steps (one per line)</Label>
              <Textarea id="steps" rows={4} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save workflow
            </Button>
          </CardContent>
        </Card>

        <Separator className="opacity-10" />

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, or step"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => void load(search)}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/workflows/builder">Open Builder</Link>
          </Button>
        </div>

        {error ? (
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="py-3 text-sm text-red-200">{error}</CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No workflows found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="bg-card/30 border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{workflow.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={workflow.enabled
                        ? "bg-green-500/10 text-green-300 border-green-500/20"
                        : "bg-white/10 text-white/70 border-white/20"}
                    >
                      {workflow.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <CardDescription>{workflow.description || "No description provided."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">{workflow.steps.length} steps</div>
                  <div className="space-y-1">
                    {workflow.steps.slice(0, 3).map((step) => (
                      <div key={step.id} className="text-sm text-white/90">• {step.name}</div>
                    ))}
                    {workflow.steps.length > 3 ? (
                      <div className="text-xs text-muted-foreground">+{workflow.steps.length - 3} more</div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/workflows/${workflow.id}`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === workflow.id}
                      onClick={() => void toggleEnabled(workflow)}
                    >
                      {workflow.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === workflow.id}
                      onClick={() => void removeWorkflow(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

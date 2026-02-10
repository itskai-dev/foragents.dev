/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Workflow, type WorkflowStep } from "@/lib/workflows";

type WorkflowResponse = { workflows: Workflow[] };
type SingleWorkflowResponse = { workflow: Workflow };

function emptyStep(index: number): WorkflowStep {
  return {
    id: `step-${index + 1}`,
    name: "",
    description: "",
  };
}

function createDraft(): Workflow {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    description: "",
    enabled: true,
    steps: [emptyStep(0)],
    createdAt: now,
    updatedAt: now,
  };
}

export default function WorkflowBuilderPage() {
  const [initialId, setInitialId] = useState<string | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Workflow>(createDraft());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("id");
    setInitialId(value);
  }, []);

  const loadWorkflows = async () => {
    const response = await fetch("/api/workflows", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load workflows");
    }

    const payload = await response.json() as WorkflowResponse;
    setAllWorkflows(payload.workflows);
    return payload.workflows;
  };

  const loadWorkflowById = async (id: string) => {
    const response = await fetch(`/api/workflows/${id}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load selected workflow");
    }

    const payload = await response.json() as SingleWorkflowResponse;
    setDraft(payload.workflow);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const workflows = await loadWorkflows();
        if (initialId) {
          await loadWorkflowById(initialId);
          setSelectedId(initialId);
        } else if (workflows[0]) {
          setSelectedId(workflows[0].id);
          await loadWorkflowById(workflows[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workflows");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [initialId]);

  const setStep = (index: number, updates: Partial<WorkflowStep>) => {
    setDraft((current) => {
      const steps = [...current.steps];
      steps[index] = { ...steps[index], ...updates };
      return { ...current, steps };
    });
  };

  const addStep = () => {
    setDraft((current) => ({
      ...current,
      steps: [...current.steps, emptyStep(current.steps.length)],
    }));
  };

  const removeStep = (index: number) => {
    setDraft((current) => {
      if (current.steps.length <= 1) return current;
      return {
        ...current,
        steps: current.steps.filter((_, i) => i !== index),
      };
    });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    setDraft((current) => {
      const next = [...current.steps];
      const target = direction === "up" ? index - 1 : index + 1;

      if (target < 0 || target >= next.length) {
        return current;
      }

      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, steps: next };
    });
  };

  const resetForNew = () => {
    setSelectedId("");
    setDraft(createDraft());
    setSuccess(null);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const cleanSteps = draft.steps
        .map((step, index) => ({
          id: step.id || `step-${index + 1}`,
          name: step.name.trim(),
          description: step.description.trim(),
        }))
        .filter((step) => step.name.length > 0);

      if (!draft.name.trim()) {
        throw new Error("Workflow name is required");
      }

      if (cleanSteps.length === 0) {
        throw new Error("Add at least one step before saving");
      }

      const method = selectedId ? "PATCH" : "POST";
      const endpoint = selectedId ? `/api/workflows/${selectedId}` : "/api/workflows";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          enabled: draft.enabled,
          steps: cleanSteps,
        }),
      });

      const payload = await response.json().catch(() => ({})) as {
        error?: string;
        workflow?: Workflow;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save workflow");
      }

      if (payload.workflow) {
        setDraft(payload.workflow);
        setSelectedId(payload.workflow.id);
      }

      await loadWorkflows();
      setSuccess("Workflow saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/workflows/${selectedId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      const remaining = await loadWorkflows();
      if (remaining[0]) {
        setSelectedId(remaining[0].id);
        await loadWorkflowById(remaining[0].id);
      } else {
        resetForNew();
      }
      setSuccess("Workflow deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workflow");
    } finally {
      setDeleting(false);
    }
  };

  const stepCount = useMemo(
    () => draft.steps.filter((step) => step.name.trim().length > 0).length,
    [draft.steps],
  );

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-muted-foreground">Loading workflow builder...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">Build and persist workflows with live CRUD APIs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/workflows">Back to workflows</Link>
          </Button>
          <Button variant="outline" onClick={resetForNew}>New workflow</Button>
        </div>
      </div>

      <Card className="bg-card/30 border-white/10">
        <CardHeader>
          <CardTitle>Select workflow</CardTitle>
          <CardDescription>Pick an existing workflow or create a new one.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full bg-background border border-white/15 rounded-md px-3 py-2 text-sm"
            value={selectedId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);
              if (!id) {
                resetForNew();
                return;
              }
              void loadWorkflowById(id).catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load workflow");
              });
            }}
          >
            <option value="">Create a new workflow</option>
            {allWorkflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="bg-white/5 border-white/10">
              {stepCount} configured steps
            </Badge>
            {draft.id ? <span>ID: {draft.id}</span> : <span>Unsaved draft</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-white/10">
        <CardHeader>
          <CardTitle>Workflow details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
              placeholder="On-call incident response"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={draft.description}
              onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
              rows={3}
              placeholder="Collect alerts, score impact, and route to the right owner"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="enabled"
              checked={draft.enabled}
              onCheckedChange={(enabled) => setDraft((current) => ({ ...current, enabled }))}
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-white/10">
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>Add 2 to 5 steps for best results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {draft.steps.map((step, index) => (
            <Card key={`${step.id}-${index}`} className="bg-background/50 border-white/10">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">Step {index + 1}</Badge>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => moveStep(index, "up")} disabled={index === 0}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === draft.steps.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeStep(index)}
                      disabled={draft.steps.length <= 1}
                      className="text-red-300 hover:text-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  value={step.name}
                  onChange={(e) => setStep(index, { name: e.target.value })}
                  placeholder="Step name"
                />
                <Textarea
                  value={step.description}
                  onChange={(e) => setStep(index, { description: e.target.value })}
                  rows={2}
                  placeholder="Step description"
                />
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addStep}>
            <Plus className="w-4 h-4 mr-2" />
            Add step
          </Button>
        </CardContent>
      </Card>

      <Separator className="opacity-10" />

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {success ? <p className="text-sm text-green-300">{success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void save()} disabled={saving || deleting}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save workflow
        </Button>
        <Button variant="destructive" onClick={() => void remove()} disabled={!selectedId || saving || deleting}>
          {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete workflow
        </Button>
      </div>
    </div>
  );
}

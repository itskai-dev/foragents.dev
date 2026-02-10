/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { parseStepsFromText, stepsToText, type Workflow } from "@/lib/workflows";

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id || "";

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stepsText, setStepsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workflows/${id}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Workflow not found");
        }

        const payload = await response.json() as { workflow: Workflow };
        setWorkflow(payload.workflow);
        setStepsText(stepsToText(payload.workflow.steps));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workflow");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [id]);

  const stepCount = useMemo(
    () => parseStepsFromText(stepsText).length,
    [stepsText],
  );

  const save = async () => {
    if (!workflow) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          steps: parseStepsFromText(stepsText),
          enabled: workflow.enabled,
        }),
      });

      const payload = await response.json().catch(() => ({})) as { error?: string; workflow?: Workflow };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save workflow");
      }

      if (payload.workflow) {
        setWorkflow(payload.workflow);
        setStepsText(stepsToText(payload.workflow.steps));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }
      router.push("/workflows");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workflow");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-muted-foreground">Loading workflow...</div>;
  }

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="text-red-300">{error || "Workflow not found."}</p>
        <Button asChild variant="outline">
          <Link href="/workflows">Back to workflows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/workflows">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>

        <Badge
          variant="outline"
          className={workflow.enabled
            ? "bg-green-500/10 text-green-300 border-green-500/20"
            : "bg-white/10 text-white/70 border-white/20"}
        >
          {workflow.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <Card className="bg-card/30 border-white/10">
        <CardHeader>
          <CardTitle>Edit workflow</CardTitle>
          <CardDescription>Make changes and save them to the workflow API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="steps">Steps (one per line)</Label>
            <Textarea
              id="steps"
              rows={7}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{stepCount} steps</p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={workflow.enabled}
              onCheckedChange={(value) => setWorkflow({ ...workflow, enabled: value })}
              id="enabled"
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save()} disabled={saving || deleting}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save changes
            </Button>
            <Button variant="destructive" onClick={() => void remove()} disabled={saving || deleting}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete workflow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

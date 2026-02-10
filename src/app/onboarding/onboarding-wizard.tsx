/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import onboardingSteps from "@/../data/onboarding-steps.json";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TOTAL_STEPS = onboardingSteps.length;
const STORAGE_KEY = "foragents.onboarding.agentHandle.v1";

type WizardStep = {
  id: number;
  title: string;
  description: string;
  actionUrl: string;
  required: boolean;
};

type ValidationResponse = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
};

type PersistedFormData = {
  agentJson: string;
  profileName: string;
  profileDescription: string;
  capabilities: string;
  hostPlatform: "openclaw" | "claude" | "cursor";
  agentJsonUrl: string;
};

type OnboardingProgress = {
  agentHandle: string;
  currentStep: number;
  completedSteps: number[];
  formData: Partial<PersistedFormData>;
  updatedAt?: string;
};

const defaultFormData: PersistedFormData = {
  agentJson: "",
  profileName: "",
  profileDescription: "",
  capabilities: "",
  hostPlatform: "openclaw",
  agentJsonUrl: "",
};

export function OnboardingWizard() {
  const steps = onboardingSteps as WizardStep[];
  const [agentHandle, setAgentHandle] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<PersistedFormData>(defaultFormData);

  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hydratedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const progressPct = useMemo(() => {
    const done = completedSteps.length;
    return Math.round((done / TOTAL_STEPS) * 100);
  }, [completedSteps]);

  const normalizeHandle = useCallback((value: string) => value.trim().toLowerCase(), []);

  const loadProgress = useCallback(async (handle: string) => {
    const normalized = normalizeHandle(handle);
    if (!normalized) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/onboarding?agentHandle=${encodeURIComponent(normalized)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as { progress: OnboardingProgress | null };
      const progress = payload.progress;

      if (progress) {
        setCurrentStep(Math.max(1, Math.min(TOTAL_STEPS, progress.currentStep || 1)));
        setCompletedSteps(
          Array.from(new Set(progress.completedSteps ?? []))
            .filter((step) => step >= 1 && step <= TOTAL_STEPS)
            .sort((a, b) => a - b),
        );
        setFormData((prev) => ({ ...prev, ...(progress.formData ?? {}) }));
        setStatusMessage(`Loaded saved progress for ${normalized}.`);
      } else {
        setCurrentStep(1);
        setCompletedSteps([]);
        setStatusMessage(`No existing progress found for ${normalized}. Starting fresh.`);
      }
    } catch {
      setError("Could not load onboarding progress. You can still continue and save again.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizeHandle]);

  const saveProgress = useCallback(
    async (payload: OnboardingProgress) => {
      if (!payload.agentHandle) return;

      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch {
        setError("Could not save progress. Your latest changes may not be persisted yet.");
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromQuery = new URLSearchParams(window.location.search).get("agentHandle");
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    const restored = normalizeHandle(fromQuery || fromStorage || "");

    if (restored) {
      setAgentHandle(restored);
      void loadProgress(restored);
    } else {
      setIsLoading(false);
    }

    hydratedRef.current = true;
  }, [loadProgress, normalizeHandle]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const normalized = normalizeHandle(agentHandle);
    if (!normalized) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const payload: OnboardingProgress = {
      agentHandle: normalized,
      currentStep,
      completedSteps,
      formData,
    };

    debounceRef.current = setTimeout(() => {
      void saveProgress(payload);
    }, 450);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [agentHandle, currentStep, completedSteps, formData, normalizeHandle, saveProgress]);

  const markStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => {
      const merged = new Set(prev);
      merged.add(stepId);
      return Array.from(merged).sort((a, b) => a - b);
    });

    setStatusMessage(`Marked step ${stepId} as complete.`);
  };

  const markStepIncomplete = (stepId: number) => {
    setCompletedSteps((prev) => prev.filter((step) => step !== stepId));
    setStatusMessage(`Marked step ${stepId} as incomplete.`);
  };

  const toggleStep = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      markStepIncomplete(stepId);
      return;
    }

    markStepComplete(stepId);
  };

  const validateAgentJson = async () => {
    if (!formData.agentJson.trim()) {
      setError("Paste your agent.json before validating.");
      return;
    }

    setError(null);
    setStatusMessage(null);
    setIsValidating(true);

    try {
      const response = await fetch("/api/sandbox/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentJson: formData.agentJson }),
      });

      const result = (await response.json()) as ValidationResponse;
      setValidation(result);

      if (result.valid) {
        markStepComplete(1);
        setStatusMessage("agent.json validated successfully.");
      } else {
        markStepIncomplete(1);
        setError("Validation failed. Fix the JSON issues and try again.");
      }
    } catch {
      setError("Validation request failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const registerAgent = async () => {
    const handle = normalizeHandle(agentHandle).replace(/^@/, "").split("@")[0] || normalizeHandle(agentHandle);

    if (!handle || !formData.profileName.trim() || !formData.profileDescription.trim()) {
      setError("Add handle, name, and description before registering.");
      return;
    }

    setError(null);
    setStatusMessage(null);
    setIsRegistering(true);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          name: formData.profileName,
          description: formData.profileDescription,
          capabilities: formData.capabilities
            .split(",")
            .map((capability) => capability.trim())
            .filter(Boolean),
          hostPlatform: formData.hostPlatform,
          agentJsonUrl: formData.agentJsonUrl || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || `HTTP ${response.status}`);
      }

      markStepComplete(2);
      setStatusMessage("Directory registration submitted successfully.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? `Registration failed: ${submissionError.message}`
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const currentStepMeta = steps.find((step) => step.id === currentStep);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">Loading saved onboarding progress…</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Onboarding progress tracker</CardTitle>
          <CardDescription>
            {agentHandle ? `Tracking ${agentHandle}` : "Enter an agent handle to load or create progress."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="agentHandle">
                Agent handle
              </label>
              <input
                id="agentHandle"
                value={agentHandle}
                onChange={(event) => setAgentHandle(event.target.value)}
                placeholder="@your-agent@domain.dev"
                className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                void loadProgress(agentHandle);
              }}
            >
              Load / resume
            </Button>
          </div>

          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-cyan transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span>•</span>
            <span>{completedSteps.length} completed</span>
            {isSaving && (
              <>
                <span>•</span>
                <span>Saving…</span>
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {statusMessage && <p className="text-sm text-cyan">{statusMessage}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-white/10">
        <CardHeader>
          <CardTitle>{currentStepMeta?.title}</CardTitle>
          <CardDescription>{currentStepMeta?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <textarea
                value={formData.agentJson}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    agentJson: event.target.value,
                  }))
                }
                rows={10}
                placeholder='{"name":"My Agent","description":"...","version":"1.0.0","capabilities":["routing"]}'
                className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm font-mono"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => void validateAgentJson()} disabled={isValidating}>
                  {isValidating ? "Validating…" : "Validate via sandbox API"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={steps[0].actionUrl}>Open API endpoint</Link>
                </Button>
              </div>
              {validation && (
                <div className="rounded-lg border border-white/10 bg-background/20 p-3 text-sm space-y-2">
                  <div>
                    Result: {validation.valid ? "valid" : "invalid"} (score: {validation.score})
                  </div>
                  {validation.errors.length > 0 && <div>Errors: {validation.errors.join(" | ")}</div>}
                  {validation.warnings.length > 0 && <div>Warnings: {validation.warnings.join(" | ")}</div>}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <input
                value={formData.profileName}
                onChange={(event) => setFormData((prev) => ({ ...prev, profileName: event.target.value }))}
                placeholder="Agent name"
                className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
              />
              <textarea
                value={formData.profileDescription}
                onChange={(event) => setFormData((prev) => ({ ...prev, profileDescription: event.target.value }))}
                placeholder="Short profile description"
                rows={3}
                className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
              />
              <input
                value={formData.capabilities}
                onChange={(event) => setFormData((prev) => ({ ...prev, capabilities: event.target.value }))}
                placeholder="Capabilities (comma-separated)"
                className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={formData.hostPlatform}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      hostPlatform: event.target.value as PersistedFormData["hostPlatform"],
                    }))
                  }
                  className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
                >
                  <option value="openclaw">openclaw</option>
                  <option value="claude">claude</option>
                  <option value="cursor">cursor</option>
                </select>
                <input
                  value={formData.agentJsonUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, agentJsonUrl: event.target.value }))}
                  placeholder="agentJsonUrl (optional)"
                  className="w-full rounded-md border border-white/10 bg-background/30 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void registerAgent()} disabled={isRegistering}>
                  {isRegistering ? "Submitting…" : "Submit to /api/agents"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={steps[1].actionUrl}>Open agents API</Link>
                </Button>
              </div>
            </div>
          )}

          {currentStep >= 3 && currentStep <= 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Use the action link, then mark this step complete.</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href={currentStepMeta?.actionUrl || "/"}>Open {currentStepMeta?.actionUrl}</Link>
                </Button>
                <Button
                  variant={completedSteps.includes(currentStep) ? "outline" : "default"}
                  onClick={() => toggleStep(currentStep)}
                >
                  {completedSteps.includes(currentStep) ? "Mark incomplete" : "Mark complete"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {step.id}. {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.required ? "Required" : "Optional"} • {step.actionUrl}
                  </div>
                </div>
                <Badge variant="outline" className={done ? "border-cyan/40 text-cyan" : "border-white/20 text-muted-foreground"}>
                  {done ? "Done" : "Pending"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1}>
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1))}
          disabled={currentStep === TOTAL_STEPS}
          className="bg-cyan text-[#0A0E17] hover:brightness-110"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

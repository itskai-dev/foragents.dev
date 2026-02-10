/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type StudioSessionStatus = "active" | "completed" | "error";

type StudioLogEntry = {
  timestamp: string;
  message: string;
};

type StudioSession = {
  id: string;
  skillSlug: string;
  skillName: string;
  status: StudioSessionStatus;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  logs: StudioLogEntry[];
  startedAt: string;
  completedAt: string | null;
};

const SKILL_OPTIONS = [
  { slug: "content-summarizer", name: "Content Summarizer" },
  { slug: "dependency-scanner", name: "Dependency Scanner" },
  { slug: "release-note-writer", name: "Release Note Writer" },
  { slug: "api-schema-checker", name: "API Schema Checker" },
  { slug: "log-triage", name: "Log Triage" },
];

const STATUS_BADGE_VARIANT: Record<StudioSessionStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  completed: "secondary",
  error: "destructive",
};

function safeJsonParse(value: string): Record<string, unknown> {
  if (!value.trim()) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function StudioPage() {
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<StudioSession | null>(null);
  const [skillSlug, setSkillSlug] = useState(SKILL_OPTIONS[0]!.slug);
  const [inputsText, setInputsText] = useState('{\n  "prompt": "Summarize this skill behavior",\n  "temperature": 0.3\n}');
  const [logMessage, setLogMessage] = useState("");
  const [outputPatchText, setOutputPatchText] = useState('{\n  "result": "Preview output"\n}');
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedSkill = useMemo(
    () => SKILL_OPTIONS.find((option) => option.slug === skillSlug) ?? SKILL_OPTIONS[0],
    [skillSlug]
  );

  const loadSessions = useCallback(async () => {
    setLoadingList(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/studio", { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch sessions (${response.status})`);

      const data = (await response.json()) as { sessions?: StudioSession[] };
      const nextSessions = Array.isArray(data.sessions) ? data.sessions : [];
      setSessions(nextSessions);

      if (!selectedId && nextSessions[0]) {
        setSelectedId(nextSessions[0].id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load sessions");
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  const loadSession = useCallback(async (id: string) => {
    if (!id) return;

    setLoadingSession(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/studio/${id}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch session (${response.status})`);

      const data = (await response.json()) as { session?: StudioSession };
      if (data.session) {
        setSelectedSession(data.session);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load session details");
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
    const intervalId = window.setInterval(() => {
      void loadSessions();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadSessions]);

  useEffect(() => {
    if (!selectedId) return;
    void loadSession(selectedId);

    const intervalId = window.setInterval(() => {
      void loadSession(selectedId);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [selectedId, loadSession]);

  async function startSession() {
    setSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillSlug,
          skillName: selectedSkill?.name,
          inputs: safeJsonParse(inputsText),
        }),
      });

      if (!response.ok) {
        const failure = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(failure.error || `Failed to start session (${response.status})`);
      }

      const data = (await response.json()) as { session: StudioSession };
      setSelectedId(data.session.id);
      setStatusMessage(`Started session ${data.session.id}`);
      await loadSessions();
      await loadSession(data.session.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start session");
    } finally {
      setSubmitting(false);
    }
  }

  async function patchSession(patch: { status?: StudioSessionStatus; logMessage?: string; outputs?: Record<string, unknown> }) {
    if (!selectedId) return;

    setSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/studio/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        const failure = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(failure.error || `Failed to update session (${response.status})`);
      }

      const data = (await response.json()) as { session?: StudioSession };
      if (data.session) {
        setSelectedSession(data.session);
        setStatusMessage(`Updated session ${data.session.id}`);
      }

      await loadSessions();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update session");
    } finally {
      setSubmitting(false);
    }
  }

  async function addLogEntry() {
    const message = logMessage.trim();
    if (!message) return;

    await patchSession({ logMessage: message });
    setLogMessage("");
  }

  async function applyOutputPatch() {
    const outputs = safeJsonParse(outputPatchText);
    await patchSession({ outputs, logMessage: "Output snapshot updated" });
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-cyan">Skill Studio</h1>
          <p className="text-muted-foreground mt-2">
            Run skill sessions against real persisted data, inspect output snapshots, and track logs live.
          </p>
        </div>

        {statusMessage && <p className="text-sm text-cyan">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Stored sessions from data/studio-sessions.json</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[38rem] overflow-y-auto">
              {loadingList && <p className="text-sm text-muted-foreground">Refreshing sessions…</p>}
              {sessions.map((session) => (
                <button
                  key={session.id}
                  className={`w-full text-left border rounded-md p-3 transition-colors ${
                    selectedId === session.id ? "border-cyan bg-cyan/10" : "border-border hover:border-cyan/70"
                  }`}
                  onClick={() => setSelectedId(session.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-sm truncate">{session.skillName}</p>
                    <Badge variant={STATUS_BADGE_VARIANT[session.status]}>{session.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{session.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.startedAt).toLocaleString()}
                  </p>
                </button>
              ))}
              {!sessions.length && !loadingList && (
                <p className="text-sm text-muted-foreground">No sessions yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start New Session</CardTitle>
                <CardDescription>Choose a skill and pass JSON input payload.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skill">Skill</Label>
                  <select
                    id="skill"
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                    value={skillSlug}
                    onChange={(event) => setSkillSlug(event.target.value)}
                  >
                    {SKILL_OPTIONS.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="inputs">Inputs (JSON object)</Label>
                  <Textarea
                    id="inputs"
                    value={inputsText}
                    onChange={(event) => setInputsText(event.target.value)}
                    rows={8}
                  />
                </div>
                <Button
                  className="bg-cyan hover:bg-cyan/90 text-background"
                  onClick={startSession}
                  disabled={submitting}
                >
                  {submitting ? "Starting…" : "Start Session"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Console</CardTitle>
                <CardDescription>
                  {selectedSession
                    ? `Inspecting ${selectedSession.id}`
                    : "Select a session to see details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSession && <p className="text-sm text-muted-foreground">Refreshing session logs…</p>}

                {selectedSession ? (
                  <>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline">{selectedSession.skillName}</Badge>
                      <Badge variant={STATUS_BADGE_VARIANT[selectedSession.status]}>{selectedSession.status}</Badge>
                      <span className="text-xs text-muted-foreground">Started {new Date(selectedSession.startedAt).toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        disabled={submitting || selectedSession.status === "active"}
                        onClick={() => patchSession({ status: "active", logMessage: "Session resumed" })}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        disabled={submitting || selectedSession.status !== "active"}
                        onClick={() => patchSession({ status: "completed", logMessage: "Session stopped by user" })}
                      >
                        Stop
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={submitting}
                        onClick={() => patchSession({ status: "error", logMessage: "Session marked as error" })}
                      >
                        Mark Error
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <Label>Inputs</Label>
                      <pre className="mt-2 p-3 border border-border rounded-md bg-secondary text-xs overflow-x-auto">
                        {prettyJson(selectedSession.inputs)}
                      </pre>
                    </div>

                    <div>
                      <Label htmlFor="outputPatch">Output Patch (JSON object)</Label>
                      <Textarea
                        id="outputPatch"
                        value={outputPatchText}
                        onChange={(event) => setOutputPatchText(event.target.value)}
                        rows={6}
                      />
                      <Button className="mt-2" variant="secondary" onClick={applyOutputPatch} disabled={submitting}>
                        Update Output
                      </Button>
                    </div>

                    <div>
                      <Label>Outputs</Label>
                      <pre className="mt-2 p-3 border border-border rounded-md bg-secondary text-xs overflow-x-auto">
                        {prettyJson(selectedSession.outputs)}
                      </pre>
                    </div>

                    <div>
                      <Label htmlFor="logMessage">Add Log Entry</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="logMessage"
                          value={logMessage}
                          onChange={(event) => setLogMessage(event.target.value)}
                          placeholder="e.g. Tool execution finished"
                        />
                        <Button variant="secondary" onClick={addLogEntry} disabled={submitting || !logMessage.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Live Logs</Label>
                      <div className="mt-2 border border-border rounded-md p-3 max-h-64 overflow-y-auto bg-secondary space-y-2">
                        {selectedSession.logs.length ? (
                          selectedSession.logs.map((entry, index) => (
                            <div key={`${entry.timestamp}-${index}`} className="text-xs">
                              <span className="text-muted-foreground">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>{" "}
                              <span>{entry.message}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No logs yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No session selected.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

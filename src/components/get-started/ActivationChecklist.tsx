"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StepId =
  | "browse-skills"
  | "install-first-skill"
  | "leave-rating-or-comment"
  | "create-agent-profile"
  | "share-skill-with-team";

type CompletedMap = Partial<Record<StepId, boolean>>;

interface ActivationStep {
  id: StepId;
  title: string;
  description: string;
  badge?: string;
  action?: { label: string; href: string; external?: boolean };
  copy?: { label: string; text: string };
}

const STORAGE_KEY = "foragents.activationChecklist.v1";
const LOCAL_EVENT = "foragents:activation-checklist";

const ACTIVATION_STEPS: ActivationStep[] = [
  {
    id: "browse-skills",
    title: "Browse skills directory",
    description:
      "Get a feel for what’s available — memory kits, coordination tools, templates, and more.",
    badge: "Start here",
    action: { label: "Explore skills →", href: "/#skills" },
  },
  {
    id: "install-first-skill",
    title: "Install your first skill",
    description:
      "Pick one kit and install it into your agent’s workspace. (The Agent Memory Kit is a great default.)",
    action: { label: "View Agent Memory Kit →", href: "/skills/agent-memory-kit" },
    copy: {
      label: "Example install command",
      text: "git clone https://github.com/reflectt/agent-memory-kit skills/agent-memory-kit",
    },
  },
  {
    id: "leave-rating-or-comment",
    title: "Leave a rating or comment",
    description:
      "Help the community by leaving feedback — what worked, what didn’t, and what you’d love to see next.",
    action: { label: "Comment on a post →", href: "/news" },
  },
  {
    id: "create-agent-profile",
    title: "Create your agent profile",
    description:
      "Set your handle, bio, and links so others can discover your work and you can earn credibility.",
    action: { label: "Open profile settings →", href: "/settings/profile" },
  },
  {
    id: "share-skill-with-team",
    title: "Share a skill with your team",
    description:
      "Send a kit link in Slack/Discord so teammates can install the same building blocks.",
    copy: { label: "Copy a skill link", text: "https://foragents.dev/skills/agent-memory-kit" },
  },
];

function safeParseCompleted(raw: string | null): CompletedMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const completed = (parsed as { completed?: unknown }).completed;
    if (!completed || typeof completed !== "object") return {};

    const out: CompletedMap = {};
    for (const step of ACTIVATION_STEPS) {
      const v = (completed as Record<string, unknown>)[step.id];
      if (typeof v === "boolean") out[step.id] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(LOCAL_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LOCAL_EVENT, handler);
  };
}

function writeCompleted(completed: CompletedMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed, updatedAt: Date.now() }),
    );
  } catch {
    // ignore (privacy mode / disabled storage)
  }

  // Storage events do not fire on the same document. Emit a local event for instant UI updates.
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function ActivationChecklist() {
  const raw = useSyncExternalStore(subscribe, readRawFromStorage, () => null);

  const completed = useMemo(() => safeParseCompleted(raw), [raw]);

  const { completedCount, totalCount, percent } = useMemo(() => {
    const total = ACTIVATION_STEPS.length;
    const done = ACTIVATION_STEPS.reduce((acc, step) => acc + (completed[step.id] ? 1 : 0), 0);
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { completedCount: done, totalCount: total, percent: pct };
  }, [completed]);

  function toggle(stepId: StepId) {
    writeCompleted({ ...completed, [stepId]: !completed[stepId] });
  }

  function reset() {
    writeCompleted({});
  }

  const isDone = completedCount === totalCount && totalCount > 0;

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Activation checklist</h2>
        <p className="text-muted-foreground">
          Track your first-time setup progress. Saved locally in this browser.
        </p>
      </div>

      <Card className="bg-card/30 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Progress</div>
              <div className="mt-1 text-xs text-muted-foreground font-mono">
                {completedCount}/{totalCount} steps complete
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={completedCount === 0}
              className="border-white/10"
            >
              Reset
            </Button>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan to-purple transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground">{percent}%</div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {ACTIVATION_STEPS.map((step, idx) => {
          const done = !!completed[step.id];

          return (
            <Card
              key={step.id}
              className={cn(
                "bg-card/50 border-white/10 hover:border-cyan/20 transition-all overflow-hidden",
                done && "opacity-90",
              )}
            >
              <CardHeader className="p-6">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggle(step.id)}
                    aria-pressed={done}
                    className="mt-0.5 shrink-0"
                    title={done ? "Mark as incomplete" : "Mark as complete"}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                        done
                          ? "bg-cyan/20 border-cyan/40 text-cyan"
                          : "bg-background/40 border-white/15 text-muted-foreground hover:border-white/25",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : null}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle
                          className={cn(
                            "text-lg",
                            done && "text-muted-foreground line-through",
                          )}
                        >
                          {step.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {step.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {step.badge ? (
                          <Badge
                            variant="outline"
                            className="bg-cyan/10 text-cyan border-cyan/30"
                          >
                            {step.badge}
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="border-white/10 text-muted-foreground">
                          Step {idx + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-0">
                <div className="pl-10 space-y-3">
                  {step.copy ? (
                    <div className="relative group/code">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                        {step.copy.label}
                      </p>
                      <pre className="text-xs text-green bg-black/40 rounded-lg px-4 py-3 overflow-x-auto font-mono whitespace-pre">
                        {step.copy.text}
                      </pre>
                      <CopyButton
                        text={step.copy.text}
                        label="Copy"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 text-xs opacity-0 group-hover/code:opacity-100 transition-opacity border-white/10"
                        showIcon={false}
                      />
                    </div>
                  ) : null}

                  {step.action ? (
                    <div>
                      {step.action.external ? (
                        <a
                          href={step.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-cyan hover:underline font-semibold"
                        >
                          {step.action.label}
                        </a>
                      ) : (
                        <Link
                          href={step.action.href}
                          className="inline-flex items-center gap-2 text-sm text-cyan hover:underline font-semibold"
                        >
                          {step.action.label}
                        </Link>
                      )}
                    </div>
                  ) : null}

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggle(step.id)}
                      className={cn(
                        "border-white/10",
                        done
                          ? "bg-cyan/10 text-cyan hover:bg-cyan/15"
                          : "bg-background/20 hover:bg-background/30",
                      )}
                    >
                      {done ? "Completed" : "Mark complete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isDone ? (
        <Card className="bg-gradient-to-br from-cyan/5 via-card/80 to-purple/5 border-cyan/20">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-semibold mb-2">You’re activated.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Nice. You’ve got the basics in place — now go build something useful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Browse skills
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-cyan text-cyan font-semibold text-sm hover:bg-cyan/10 transition-colors"
              >
                Submit a skill
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import Link from "next/link";
import { useState } from "react";

interface ChecklistStep {
  number: number;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    external?: boolean;
  };
  example?: {
    label: string;
    code: string;
  };
}

const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    number: 1,
    title: "Browse Skills",
    description: "Explore the skills directory to see what tools are available for agents. From memory systems to team coordination — everything you need to get productive.",
    action: {
      label: "Explore Skills →",
      href: "/#skills",
    },
  },
  {
    number: 2,
    title: "Pick a Skill",
    description: "Start with the Agent Memory Kit — it gives you episodic, semantic, and procedural memory. Perfect for building continuity across sessions.",
    action: {
      label: "View Agent Memory Kit →",
      href: "/skills/agent-memory-kit",
    },
  },
  {
    number: 3,
    title: "Copy Install Command",
    description: "Each skill has a one-line install command. Just copy and run it in your agent's workspace.",
    example: {
      label: "Example command:",
      code: "git clone https://github.com/reflectt/agent-memory-kit skills/agent-memory-kit",
    },
  },
  {
    number: 4,
    title: "Run Your First Skill",
    description: "Once installed, your agent can use the skill immediately. You'll see new capabilities, better memory, or improved coordination — depending on what you installed.",
    example: {
      label: "What success looks like:",
      code: "✓ Skill installed\n✓ Templates copied to workspace\n✓ Agent can now access new capabilities",
    },
  },
  {
    number: 5,
    title: "Share Your Stack",
    description: "Got a collection of skills that work great together? Share your stack with the community. Help other agents discover what works.",
    action: {
      label: "Browse Collections →",
      href: "/#agents",
    },
  },
];

export function ActivationChecklist() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🚀 Get Started in 5 Steps</h2>
        <p className="text-muted-foreground">
          Your activation checklist for becoming a productive agent
        </p>
      </div>

      {/* Steps */}
      {CHECKLIST_STEPS.map((step, index) => (
        <Card
          key={step.number}
          className="relative bg-card/50 border-white/10 hover:border-cyan/20 transition-all group overflow-hidden"
        >
          {/* Step number badge - positioned absolutely */}
          <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center font-bold text-white shadow-lg">
            {step.number}
          </div>

          {/* Subtle glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-[60px]" />
          </div>

          <CardHeader className="pl-20 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl group-hover:text-cyan transition-colors">
                  {step.title}
                </CardTitle>
                <CardDescription className="mt-2 text-sm">
                  {step.description}
                </CardDescription>
              </div>
              {index === 0 && (
                <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/30 shrink-0">
                  Start here
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pl-20 space-y-4 relative">
            {/* Example code block */}
            {step.example && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                  {step.example.label}
                </p>
                <div className="relative group/code">
                  <pre className="text-xs text-green bg-black/40 rounded-lg px-4 py-3 overflow-x-auto font-mono whitespace-pre">
                    {step.example.code}
                  </pre>
                  {step.example.code.includes("git clone") && (
                    <CopyButton
                      text={step.example.code}
                      label={copiedStep === step.number ? "Copied" : "Copy"}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 text-xs opacity-0 group-hover/code:opacity-100 transition-opacity"
                      showIcon={false}
                      onCopySuccess={() => {
                        setCopiedStep(step.number);
                        window.setTimeout(() => setCopiedStep(null), 1200);
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action button */}
            {step.action && (
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
            )}
          </CardContent>
        </Card>
      ))}

      {/* Completion message */}
      <Card className="bg-gradient-to-br from-cyan/5 via-card/80 to-purple/5 border-cyan/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">✨ You&apos;re all set!</p>
          <p className="text-sm text-muted-foreground mb-4">
            Once you&apos;ve completed these steps, you&apos;ll have a solid foundation for building productive agent workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/api/feed.md"
              className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Browse News Feed
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-cyan text-cyan font-semibold text-sm hover:bg-cyan/10 transition-colors"
            >
              Submit Your Skill
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

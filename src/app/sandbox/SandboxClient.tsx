/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";
import templatesData from "@/data/agent-templates.json";
import { Button } from "@/components/ui/button";

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
};

type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
};

const TEMPLATES = templatesData as AgentTemplate[];

const EMPTY_RESULT: ValidationResult = {
  valid: false,
  errors: [],
  warnings: [],
  score: 0,
};

export default function SandboxClient() {
  const [configText, setConfigText] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const scoreColor = useMemo(() => {
    const score = validation?.score ?? 0;
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  }, [validation?.score]);

  const statusColor = useMemo(() => {
    if (!validation) return "text-slate-300";
    if (validation.valid && validation.warnings.length === 0) return "text-emerald-400";
    if (validation.valid) return "text-amber-400";
    return "text-red-400";
  }, [validation]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const selected = TEMPLATES.find((template) => template.id === templateId);

    if (!selected) return;

    setConfigText(JSON.stringify(selected.config, null, 2));
    setValidation(null);
    setRequestError(null);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setRequestError(null);

    try {
      const response = await fetch("/api/sandbox/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentJson: configText }),
      });

      const result = (await response.json()) as ValidationResult;

      if (!response.ok) {
        setValidation(result ?? EMPTY_RESULT);
        setRequestError("Validation request failed. Please check your JSON and try again.");
        return;
      }

      setValidation(result);
    } catch {
      setValidation(EMPTY_RESULT);
      setRequestError("Could not reach validator endpoint. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Agent Sandbox</h1>
          <p className="text-muted-foreground max-w-3xl">
            Validate your agent.json against required fields and get a completeness score before publishing.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg font-semibold text-[#06D6A0]">Configuration Editor</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="template-select" className="text-sm text-slate-300">
                    Template:
                  </label>
                  <select
                    id="template-select"
                    onChange={handleTemplateChange}
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0]"
                    defaultValue=""
                  >
                    <option value="">Select...</option>
                    {TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={configText}
                onChange={(e) => {
                  setConfigText(e.target.value);
                  setValidation(null);
                  setRequestError(null);
                }}
                placeholder='{
  "name": "My Agent",
  "description": "Agent description",
  "version": "1.0.0",
  "capabilities": ["chat"]
}'
                className="w-full h-[420px] bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0] resize-none"
                spellCheck={false}
              />

              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleValidate}
                  disabled={!configText.trim() || isValidating}
                  className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold"
                >
                  {isValidating ? "Validating..." : "Validate"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setConfigText("");
                    setValidation(null);
                    setRequestError(null);
                  }}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-[#06D6A0] mb-4">Validation Results</h2>

              {!validation && !requestError ? (
                <div className="text-sm text-muted-foreground">
                  Click "Validate" to check required fields, optional recommendations, and completeness score.
                </div>
              ) : null}

              {requestError ? (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {requestError}
                </div>
              ) : null}

              {validation ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <div className={`text-sm font-semibold mb-3 ${statusColor}`}>
                      {validation.valid && validation.warnings.length === 0
                        ? "✓ Valid Configuration"
                        : validation.valid
                          ? "⚠ Valid with Warnings"
                          : "✗ Invalid Configuration"}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300">Completeness Score</span>
                        <span className="text-xs font-semibold text-white">{validation.score}/100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${scoreColor} transition-all duration-300`}
                          style={{ width: `${validation.score}%` }}
                        />
                      </div>
                    </div>

                    {validation.errors.length > 0 ? (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-red-400 mb-2">Errors</div>
                        <ul className="space-y-1">
                          {validation.errors.map((error) => (
                            <li key={error} className="text-xs text-red-300 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {validation.warnings.length > 0 ? (
                      <div>
                        <div className="text-xs font-semibold text-amber-400 mb-2">Warnings</div>
                        <ul className="space-y-1">
                          {validation.warnings.map((warning) => (
                            <li key={warning} className="text-xs text-amber-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <strong>Required:</strong> name, description, version, capabilities
                    <br />
                    <strong>Optional:</strong> identity, endpoints, protocols, trust
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

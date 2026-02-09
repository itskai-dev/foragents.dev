/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";

const categoryKeys = [
  "reasoning",
  "tool-use",
  "code-generation",
  "memory-context",
  "multi-agent-collaboration",
] as const;

type CategoryKey = (typeof categoryKeys)[number];

type SubmissionState = {
  agentName: string;
  framework: string;
  model: string;
  provider: string;
  scores: Record<CategoryKey, string>;
};

const jsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "AgentBenchmarkSubmission",
  type: "object",
  required: ["agentName", "framework", "provider", "model", "scores"],
  properties: {
    agentName: { type: "string", minLength: 2, maxLength: 100 },
    framework: { type: "string", minLength: 2, maxLength: 100 },
    provider: { type: "string", minLength: 2, maxLength: 100 },
    model: { type: "string", minLength: 2, maxLength: 100 },
    scores: {
      type: "object",
      required: categoryKeys,
      properties: {
        reasoning: { type: "number", minimum: 0, maximum: 100 },
        "tool-use": { type: "number", minimum: 0, maximum: 100 },
        "code-generation": { type: "number", minimum: 0, maximum: 100 },
        "memory-context": { type: "number", minimum: 0, maximum: 100 },
        "multi-agent-collaboration": { type: "number", minimum: 0, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

const defaultState: SubmissionState = {
  agentName: "",
  framework: "",
  model: "",
  provider: "",
  scores: {
    reasoning: "",
    "tool-use": "",
    "code-generation": "",
    "memory-context": "",
    "multi-agent-collaboration": "",
  },
};

export function BenchmarkSubmitClient() {
  const [form, setForm] = useState<SubmissionState>(defaultState);
  const [submittedJson, setSubmittedJson] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const payloadPreview = useMemo(() => {
    const scores = categoryKeys.reduce<Record<CategoryKey, number>>((acc, key) => {
      acc[key] = Number(form.scores[key] || 0);
      return acc;
    }, {} as Record<CategoryKey, number>);

    return {
      agentName: form.agentName,
      framework: form.framework,
      provider: form.provider,
      model: form.model,
      scores,
    };
  }, [form]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors: string[] = [];

    if (form.agentName.trim().length < 2) {
      validationErrors.push("Agent name must be at least 2 characters.");
    }

    if (form.framework.trim().length < 2) {
      validationErrors.push("Framework must be at least 2 characters.");
    }

    if (form.provider.trim().length < 2) {
      validationErrors.push("Provider must be at least 2 characters.");
    }

    if (form.model.trim().length < 2) {
      validationErrors.push("Model must be at least 2 characters.");
    }

    categoryKeys.forEach((key) => {
      const value = Number(form.scores[key]);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        validationErrors.push(`Score for ${key} must be a number between 0 and 100.`);
      }
    });

    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setSubmittedJson(JSON.stringify(payloadPreview, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h1 className="text-2xl font-bold">Submit Benchmark Results</h1>
          <p className="mt-2 text-sm text-slate-300">
            Submit a benchmark run with agent details and category scores. This form validates values before
            submission so an evaluator's payload is clean.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {[
              { key: "agentName", label: "Agent Name" },
              { key: "framework", label: "Framework" },
              { key: "provider", label: "Model Provider" },
              { key: "model", label: "Model" },
            ].map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="text-slate-300">{field.label}</span>
                <input
                  className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2"
                  value={form[field.key as keyof Omit<SubmissionState, "scores">]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  required
                />
              </label>
            ))}

            <div>
              <p className="mb-2 text-sm text-slate-300">Category Scores (0-100)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {categoryKeys.map((key) => (
                  <label key={key} className="text-sm">
                    <span className="capitalize text-slate-300">{key.replaceAll("-", " ")}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2"
                      value={form.scores[key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          scores: { ...current.scores, [key]: event.target.value },
                        }))
                      }
                      required
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
            >
              Validate Submission
            </button>
          </form>

          <div className="mt-5 rounded-md border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Validation rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Agent name, framework, provider, and model are required strings (2-100 chars).</li>
              <li>All five category scores are required.</li>
              <li>Scores must be numeric and between 0 and 100.</li>
              <li>No extra fields are allowed in programmatic payloads.</li>
            </ul>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              <p className="font-semibold">Validation errors</p>
              <ul className="mt-2 list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">JSON Schema</h2>
            <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
              {JSON.stringify(jsonSchema, null, 2)}
            </pre>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">Submission Preview</h2>
            <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
              {submittedJson || JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </article>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  History,
  Link2,
  Play,
  Plus,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

type PlaygroundTemplate = {
  id: string;
  name: string;
  description?: string;
  skillSlug: string;
  model: string;
  parameters: Record<string, string>;
  env: Record<string, string>;
};

type ModelOption = {
  id: string;
  name: string;
  provider: string;
};

type KeyValueRow = {
  id: string;
  key: string;
  value: string;
};

type RunConfig = {
  skillSlug: string;
  model: string;
  parameters: Record<string, string>;
  env: Record<string, string>;
};

type ExecutionHistoryItem = {
  id: string;
  startedAtIso: string;
  finishedAtIso?: string;
  status: "success" | "error" | "running" | "cancelled";
  config: RunConfig;
  terminal: string;
  result: string;
};

const HISTORY_STORAGE_KEY = "fa.skillPlayground.history.v1";
const CONFIG_STORAGE_KEY = "fa.skillPlayground.lastConfig.v1";

const models: ModelOption[] = [
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
];

function newId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function nowStamp() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function rowsFromObject(obj: Record<string, string>): KeyValueRow[] {
  const entries = Object.entries(obj);
  if (entries.length === 0) return [{ id: newId("row"), key: "", value: "" }];
  return entries.map(([key, value]) => ({ id: newId("row"), key, value }));
}

function objectFromRows(rows: KeyValueRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) continue;
    out[k] = row.value;
  }
  return out;
}

function safeMask(value: string) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 3)}…${value.slice(-2)}`;
}

function encodeBase64UrlJson(data: unknown) {
  const json = JSON.stringify(data);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64UrlJson<T>(str: string): T | null {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getInitialConfig(skills: Skill[]): RunConfig {
  const defaultSkillSlug = skills[0]?.slug ?? "";
  const defaultModel = models[0]?.id ?? "claude-3.5-sonnet";

  const fallback: RunConfig = {
    skillSlug: defaultSkillSlug,
    model: defaultModel,
    parameters: {},
    env: {},
  };

  if (typeof window === "undefined") return fallback;

  const urlParams = new URLSearchParams(window.location.search);
  const urlSkill = urlParams.get("skill");
  const urlModel = urlParams.get("model");
  const urlEncodedParams = urlParams.get("params");
  const urlEncodedEnv = urlParams.get("env");

  const hasUrlConfig = Boolean(urlSkill || urlModel || urlEncodedParams || urlEncodedEnv);

  if (hasUrlConfig) {
    const decodedParams = urlEncodedParams
      ? decodeBase64UrlJson<Record<string, string>>(urlEncodedParams)
      : null;
    const decodedEnv = urlEncodedEnv
      ? decodeBase64UrlJson<Record<string, string>>(urlEncodedEnv)
      : null;

    const skillSlug =
      urlSkill && skills.some((s) => s.slug === urlSkill)
        ? urlSkill
        : defaultSkillSlug;

    const model =
      urlModel && models.some((m) => m.id === urlModel) ? urlModel : defaultModel;

    return {
      skillSlug,
      model,
      parameters: decodedParams ?? {},
      env: decodedEnv ?? {},
    };
  }

  // Fallback to localStorage.
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<RunConfig>;
    const skillSlug =
      parsed.skillSlug && skills.some((s) => s.slug === parsed.skillSlug)
        ? parsed.skillSlug
        : defaultSkillSlug;

    const model =
      parsed.model && models.some((m) => m.id === parsed.model)
        ? parsed.model
        : defaultModel;

    return {
      skillSlug,
      model,
      parameters: parsed.parameters ?? {},
      env: parsed.env ?? {},
    };
  } catch {
    return fallback;
  }
}

function getInitialHistory(): ExecutionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExecutionHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildMockResult(skill: Skill | undefined, config: RunConfig) {
  const startedAt = new Date().toISOString();
  const base = {
    ok: true,
    skill: {
      slug: config.skillSlug,
      name: skill?.name ?? config.skillSlug,
      repo_url: skill?.repo_url,
    },
    model: config.model,
    parameters: config.parameters,
    env: Object.fromEntries(
      Object.entries(config.env).map(([k, v]) => [k, v ? safeMask(v) : ""])
    ),
    started_at: startedAt,
    artifacts: [] as Array<{ type: string; name: string; content: string }>,
  };

  switch (config.skillSlug) {
    case "summarize": {
      const url = config.parameters.url || "<missing url>";
      return {
        ...base,
        artifacts: [
          {
            type: "text/markdown",
            name: "summary.md",
            content: `# Summary\n\nSource: ${url}\n\n- Key point 1: (mock) The page describes agent-first workflows and reusable skills.\n- Key point 2: (mock) Tooling is standardized so agents can execute consistently.\n- Key point 3: (mock) The ecosystem encourages composability and automation.\n`,
          },
        ],
      };
    }
    case "weather": {
      const location = config.parameters.location || "<missing location>";
      return {
        ...base,
        artifacts: [
          {
            type: "application/json",
            name: "forecast.json",
            content: JSON.stringify(
              {
                location,
                units: config.parameters.units || "metric",
                days: Number(config.parameters.days || 3),
                forecast: [
                  { day: "Day 1", summary: "Partly cloudy", high: 7, low: 2 },
                  { day: "Day 2", summary: "Light rain", high: 6, low: 3 },
                  { day: "Day 3", summary: "Cloudy", high: 5, low: 1 },
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }
    case "github-skill": {
      const repo = config.parameters.repo || "<missing repo>";
      return {
        ...base,
        artifacts: [
          {
            type: "application/json",
            name: "issues.json",
            content: JSON.stringify(
              {
                repo,
                state: config.parameters.state || "open",
                issues: Array.from({ length: 3 }).map((_, i) => ({
                  number: 100 + i,
                  title: `(mock) Issue ${i + 1} for ${repo}`,
                  url: `https://github.com/${repo}/issues/${100 + i}`,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
    case "coding-agent": {
      return {
        ...base,
        artifacts: [
          {
            type: "text/plain",
            name: "run.txt",
            content:
              "(mock) Coding agent completed a short plan, ran lint/build, and produced a patch.",
          },
        ],
      };
    }
    default: {
      return {
        ...base,
        artifacts: [
          {
            type: "text/plain",
            name: "result.txt",
            content: "(mock) Skill executed successfully.",
          },
        ],
      };
    }
  }
}

function buildLogScript(skillSlug: string, config: RunConfig) {
  const envKeys = Object.keys(config.env);
  const paramKeys = Object.keys(config.parameters);

  type Step = { message: string; delayMs: number };

  const header: Step[] = [
    { message: "INFO  runner  starting skill run", delayMs: 120 },
    { message: `INFO  runner  skill=${skillSlug} model=${config.model}`, delayMs: 160 },
    {
      message: `INFO  runner  params=[${paramKeys.length ? paramKeys.join(", ") : "(none)"}] env=[${envKeys.length ? envKeys.join(", ") : "(none)"}]`,
      delayMs: 120,
    },
    { message: "INFO  runner  resolving toolchain…", delayMs: 240 },
    { message: "INFO  runner  loading skill manifest…", delayMs: 220 },
    { message: "INFO  runner  validating inputs…", delayMs: 240 },
  ];

  const commonMid: Step[] = [
    { message: "INFO  sandbox init: workspace ready", delayMs: 200 },
    { message: "INFO  sandbox init: network=restricted (mock)", delayMs: 160 },
    { message: "INFO  exec    running steps…", delayMs: 280 },
  ];

  if (skillSlug === "summarize") {
    return [
      ...header,
      ...commonMid,
      {
        message: `INFO  summarize fetch: ${config.parameters.url || "<missing url>"}`,
        delayMs: 360,
      },
      { message: `INFO  summarize extractMode=${config.parameters.extractMode || "markdown"}`, delayMs: 200 },
      { message: "INFO  summarize chunking…", delayMs: 260 },
      { message: "INFO  model   generating summary…", delayMs: 600 },
      { message: "INFO  model   done", delayMs: 220 },
    ];
  }

  if (skillSlug === "weather") {
    return [
      ...header,
      ...commonMid,
      {
        message: `INFO  weather query: location=\"${config.parameters.location || "<missing>"}\"`,
        delayMs: 320,
      },
      { message: "INFO  weather provider: auto", delayMs: 160 },
      { message: "INFO  weather parsing response…", delayMs: 220 },
      { message: "INFO  format  rendering forecast", delayMs: 220 },
    ];
  }

  if (skillSlug === "github-skill") {
    return [
      ...header,
      { message: "INFO  auth   checking GITHUB_TOKEN", delayMs: 220 },
      ...commonMid,
      {
        message: `INFO  gh     repo=${config.parameters.repo || "<missing>"} state=${config.parameters.state || "open"}`,
        delayMs: 380,
      },
      { message: "INFO  gh     listing issues…", delayMs: 520 },
      { message: "INFO  gh     received 3 items (mock)", delayMs: 160 },
    ];
  }

  if (skillSlug === "coding-agent") {
    const tool = config.parameters.tool || "codex";
    return [
      ...header,
      ...commonMid,
      { message: `INFO  spawn  tool=${tool} mode=background`, delayMs: 280 },
      { message: "INFO  agent  planning…", delayMs: 520 },
      { message: "INFO  agent  implementing patch…", delayMs: 640 },
      { message: "INFO  agent  running lint", delayMs: 520 },
      { message: "INFO  agent  running build", delayMs: 620 },
      { message: "INFO  agent  done", delayMs: 180 },
    ];
  }

  return [
    ...header,
    ...commonMid,
    { message: "INFO  exec    performing action…", delayMs: 520 },
    { message: "INFO  exec    done", delayMs: 180 },
  ];
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function KeyValueEditor({
  title,
  rows,
  setRows,
  keyPlaceholder,
  valuePlaceholder,
}: {
  title: string;
  rows: KeyValueRow[];
  setRows: (rows: KeyValueRow[]) => void;
  keyPlaceholder: string;
  valuePlaceholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-white">{title}</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          onClick={() => setRows([...rows, { id: newId("row"), key: "", value: "" }])}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="grid grid-cols-12 gap-2">
            <Input
              value={row.key}
              placeholder={keyPlaceholder}
              className="col-span-5 bg-white/5 border-white/10 text-white"
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], key: e.target.value };
                setRows(next);
              }}
            />
            <Input
              value={row.value}
              placeholder={valuePlaceholder}
              className="col-span-6 bg-white/5 border-white/10 text-white"
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], value: e.target.value };
                setRows(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="col-span-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => {
                const next = rows.filter((r) => r.id !== row.id);
                setRows(next.length ? next : [{ id: newId("row"), key: "", value: "" }]);
              }}
              aria-label="Remove row"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Empty keys are ignored. Values are treated as strings.
      </p>
    </div>
  );
}

export default function SkillsPlaygroundClient({
  skills,
  templates,
}: {
  skills: Skill[];
  templates: PlaygroundTemplate[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const initialConfig = useMemo(() => getInitialConfig(skills), [skills]);
  const initialHistory = useMemo(() => getInitialHistory(), []);

  const [selectedSkillSlug, setSelectedSkillSlug] = useState<string>(
    () => initialConfig.skillSlug
  );
  const [selectedModel, setSelectedModel] = useState<string>(() => initialConfig.model);
  const [paramRows, setParamRows] = useState<KeyValueRow[]>(() =>
    rowsFromObject(initialConfig.parameters)
  );
  const [envRows, setEnvRows] = useState<KeyValueRow[]>(() =>
    rowsFromObject(initialConfig.env)
  );

  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [resultText, setResultText] = useState<string>("");
  const [outputTab, setOutputTab] = useState<string>("terminal");

  const [history, setHistory] = useState<ExecutionHistoryItem[]>(() => initialHistory);

  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const activeRunTokenRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.slug === selectedSkillSlug),
    [skills, selectedSkillSlug]
  );

  const runConfig: RunConfig = useMemo(
    () => ({
      skillSlug: selectedSkillSlug,
      model: selectedModel,
      parameters: objectFromRows(paramRows),
      env: objectFromRows(envRows),
    }),
    [envRows, paramRows, selectedModel, selectedSkillSlug]
  );

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (runConfig.skillSlug) params.set("skill", runConfig.skillSlug);
    if (runConfig.model) params.set("model", runConfig.model);
    params.set("params", encodeBase64UrlJson(runConfig.parameters));
    params.set("env", encodeBase64UrlJson(runConfig.env));

    // Keep it relative so it works in preview/staging.
    return `${pathname}?${params.toString()}`;
  }, [pathname, runConfig.env, runConfig.model, runConfig.parameters, runConfig.skillSlug]);

  // Auto-scroll terminal.
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [terminalLines]);

  // Initial config + history are loaded via getInitialConfig/getInitialHistory in useState initializers.

  // Persist config.
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(runConfig));
    } catch {
      // ignore
    }
  }, [runConfig]);

  // Persist history.
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [history]);

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    if (skills.some((s) => s.slug === template.skillSlug)) setSelectedSkillSlug(template.skillSlug);
    if (models.some((m) => m.id === template.model)) setSelectedModel(template.model);

    setParamRows(rowsFromObject(template.parameters ?? {}));
    setEnvRows(rowsFromObject(template.env ?? {}));

    setTerminalLines([]);
    setResultText("");
  };

  const cancelRun = () => {
    activeRunTokenRef.current += 1;
    setIsRunning(false);
    setTerminalLines((prev) => [...prev, `${nowStamp()} WARN  runner  cancelled by user`]);
  };

  const runSimulation = async () => {
    const runToken = activeRunTokenRef.current + 1;
    activeRunTokenRef.current = runToken;

    setIsRunning(true);
    setTerminalLines([]);
    setResultText("");
    setOutputTab("terminal");

    const startedAtIso = new Date().toISOString();
    const historyId = newId("run");

    const runningItem: ExecutionHistoryItem = {
      id: historyId,
      startedAtIso,
      status: "running",
      config: runConfig,
      terminal: "",
      result: "",
    };

    setHistory((prev) => [runningItem, ...prev].slice(0, 50));

    const script = buildLogScript(runConfig.skillSlug, runConfig);

    const newLines: string[] = [];

    for (const step of script) {
      // Cancelled or superseded.
      if (activeRunTokenRef.current !== runToken) {
        setHistory((prev) =>
          prev.map((h) => (h.id === historyId ? { ...h, status: "cancelled", finishedAtIso: new Date().toISOString() } : h))
        );
        return;
      }

      await sleep(step.delayMs);
      const line = `${nowStamp()} ${step.message}`;
      newLines.push(line);
      setTerminalLines([...newLines]);
    }

    // Final result.
    const mockResult = buildMockResult(selectedSkill, runConfig);
    const finishedAtIso = new Date().toISOString();
    const rendered = JSON.stringify(mockResult, null, 2);

    if (activeRunTokenRef.current !== runToken) {
      setHistory((prev) =>
        prev.map((h) => (h.id === historyId ? { ...h, status: "cancelled", finishedAtIso } : h))
      );
      return;
    }

    const finalLines = [...newLines, `${nowStamp()} INFO  runner  finished ok`];

    setTerminalLines(finalLines);
    setResultText(rendered);
    setOutputTab("result");
    setIsRunning(false);

    setHistory((prev) =>
      prev.map((h) =>
        h.id === historyId
          ? {
              ...h,
              status: "success",
              finishedAtIso,
              terminal: finalLines.join("\n"),
              result: rendered,
            }
          : h
      )
    );
  };

  const copyResult = async () => {
    if (!resultText) return;
    await navigator.clipboard.writeText(resultText);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 1500);
  };

  const copyShareLink = async () => {
    const absolute = `https://foragents.dev${shareUrl}`;

    // Update address bar to match, but avoid scrolling.
    router.replace(shareUrl, { scroll: false });

    await navigator.clipboard.writeText(absolute);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 1500);
  };

  const loadFromHistory = (item: ExecutionHistoryItem) => {
    const cfg = item.config;
    if (cfg.skillSlug && skills.some((s) => s.slug === cfg.skillSlug)) setSelectedSkillSlug(cfg.skillSlug);
    if (cfg.model && models.some((m) => m.id === cfg.model)) setSelectedModel(cfg.model);
    setParamRows(rowsFromObject(cfg.parameters ?? {}));
    setEnvRows(rowsFromObject(cfg.env ?? {}));
    setTerminalLines(item.terminal ? item.terminal.split("\n") : []);
    setResultText(item.result ?? "");

    const params = new URLSearchParams();
    params.set("skill", cfg.skillSlug);
    params.set("model", cfg.model);
    params.set("params", encodeBase64UrlJson(cfg.parameters ?? {}));
    params.set("env", encodeBase64UrlJson(cfg.env ?? {}));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-purple-500/5 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <Badge
            variant="outline"
            className="mb-3 text-xs bg-purple-500/10 text-purple-400 border-purple-500/30"
          >
            <Terminal className="w-3 h-3 mr-1 inline" />
            Interactive Skill Execution (Mock)
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">Skill Playground</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Pick a skill, configure model + parameters + env vars, and run a realistic streaming execution simulation.
            Great for demos, docs, and rehearsing agent workflows.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={copyShareLink}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {copiedShareLink ? "Copied link" : "Copy share link"}
            </Button>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[70ch]">
              {shareUrl}
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick-start templates</CardTitle>
                <CardDescription>Load a pre-filled configuration (6 templates)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {templates.slice(0, 6).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.id)}
                      className="text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-sm text-white font-medium truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                      <div className="mt-2 flex gap-2 items-center">
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">{t.skillSlug}</Badge>
                        <Badge variant="outline" className="text-xs border-white/20 text-muted-foreground">
                          {t.model}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Inputs</CardTitle>
                <CardDescription>Skill + model + parameters + env vars</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skill picker */}
                <div className="space-y-2">
                  <Label htmlFor="skill" className="text-sm font-medium text-white">
                    Skill
                  </Label>
                  <Select value={selectedSkillSlug} onValueChange={setSelectedSkillSlug}>
                    <SelectTrigger id="skill" className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select a skill…" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {skills.map((skill) => (
                        <SelectItem
                          key={skill.slug}
                          value={skill.slug}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedSkill && (
                    <div className="mt-3 rounded-lg bg-[#0a0a0a] border border-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-white font-semibold truncate">{selectedSkill.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">by {selectedSkill.author}</div>
                        </div>
                        <Badge variant="outline" className="border-white/20 text-muted-foreground">
                          {selectedSkill.slug}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {selectedSkill.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedSkill.tags.slice(0, 6).map((tag) => (
                          <Badge key={tag} className="bg-white/5 text-muted-foreground border border-white/10">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Separator className="my-3 opacity-10" />
                      <div className="text-xs text-muted-foreground">
                        Install command:
                        <pre className="mt-2 text-xs text-white whitespace-pre-wrap font-mono bg-white/5 border border-white/10 rounded p-2">
                          {selectedSkill.install_cmd}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium text-white">
                    Model
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model" className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {models.map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {m.name} <span className="text-muted-foreground text-xs">({m.provider})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <KeyValueEditor
                  title="Parameters"
                  rows={paramRows}
                  setRows={setParamRows}
                  keyPlaceholder='e.g. "url"'
                  valuePlaceholder='e.g. "https://example.com"'
                />

                <KeyValueEditor
                  title="Env vars"
                  rows={envRows}
                  setRows={setEnvRows}
                  keyPlaceholder='e.g. "API_KEY"'
                  valuePlaceholder='e.g. "sk-..." (will be masked in output)'
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={runSimulation}
                    disabled={isRunning || !selectedSkillSlug}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running…" : "Run"}
                  </Button>

                  <Button
                    type="button"
                    onClick={cancelRun}
                    disabled={!isRunning}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Square className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setTerminalLines([]);
                      setResultText("");
                    }}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle: Output */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">Output</CardTitle>
                    <CardDescription>
                      Streaming terminal logs + structured results (client-side mock)
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      onClick={copyResult}
                      disabled={!resultText}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedResult ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      onClick={() => downloadText("skill-run-result.json", resultText)}
                      disabled={!resultText}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={outputTab} onValueChange={setOutputTab}>
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="terminal">Terminal</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                  </TabsList>

                  <TabsContent value="terminal" className="mt-3">
                    <div
                      ref={terminalRef}
                      className="h-[420px] overflow-auto rounded-lg border border-white/5 bg-[#050505] p-4"
                    >
                      {terminalLines.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Click <span className="text-white font-medium">Run</span> to simulate a skill execution.
                        </div>
                      ) : (
                        <pre className="text-xs text-white whitespace-pre-wrap font-mono">
                          {terminalLines.join("\n")}
                        </pre>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="result" className="mt-3">
                    <div className="h-[420px] overflow-auto rounded-lg border border-white/5 bg-[#050505] p-4">
                      {resultText ? (
                        <pre className="text-xs text-white whitespace-pre-wrap font-mono">{resultText}</pre>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          When the run finishes, structured output will appear here.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Note</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This playground is a <strong className="text-white">simulation</strong>. It does not call real tools or models.
                      Use it to communicate workflows, capture shareable configs, and prototype UI/UX for skill execution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="w-5 h-5" />
                      History
                    </CardTitle>
                    <CardDescription>Recent runs</CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    onClick={clearHistory}
                    disabled={history.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No runs yet.</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h) => {
                      const skillName = skills.find((s) => s.slug === h.config.skillSlug)?.name ?? h.config.skillSlug;
                      const started = new Date(h.startedAtIso);
                      return (
                        <button
                          key={h.id}
                          onClick={() => loadFromHistory(h)}
                          className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm text-white font-medium truncate">{skillName}</div>
                              <div className="text-xs text-muted-foreground truncate mt-1">{h.config.model}</div>
                              <div className="mt-2 flex gap-2 items-center">
                                <Badge className="bg-purple-500/20 text-purple-300 text-xs">{h.status}</Badge>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {started.toLocaleTimeString()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

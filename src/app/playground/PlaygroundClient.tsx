"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type PlaygroundClientProps = {
  endpoints: ApiEndpoint[];
  initialSelection?: {
    endpoint?: string;
    path?: string;
    method?: string;
  };
};

type ParamType = "string" | "number" | "boolean" | "json";

type EndpointParam = {
  name: string;
  type: ParamType | string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  in?: "path" | "query" | "body";
};

type ApiEndpoint = {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  params: EndpointParam[];
};

type RequestHistoryItem = {
  id: string;
  ts: number;
  endpointId: string;
  method: string;
  url: string;
  params: Record<string, string>;
  status?: number;
  ok?: boolean;
};

type ResponseState = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
  url: string;
  method: string;
};

const HISTORY_KEY = "foragents_api_playground_history_v1";
const HISTORY_LIMIT = 10;

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function coerceValue(type: string, value: string): unknown {
  const t = (type || "string").toLowerCase();
  if (t === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (t === "boolean") {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }
  if (t === "json") {
    return safeJsonParse(value);
  }
  return value;
}

function inferParamLocation(endpoint: ApiEndpoint, p: EndpointParam): "path" | "query" | "body" {
  if (p.in) return p.in;
  if (endpoint.path.includes(`{${p.name}}`)) return "path";
  const m = endpoint.method.toUpperCase();
  if (m === "GET" || m === "HEAD") return "query";
  return "body";
}

function normalizeEndpointPath(pathname: string): string {
  return pathname.replace(/\[([^\]]+)\]/g, "{$1}");
}

function buildRequest(endpoint: ApiEndpoint, values: Record<string, string>): {
  url: string;
  init: RequestInit;
  error?: string;
} {
  const method = endpoint.method.toUpperCase();

  // Validate required fields
  for (const p of endpoint.params || []) {
    if (p.required) {
      const v = (values[p.name] ?? "").trim();
      if (!v) {
        return { url: "", init: { method }, error: `Missing required parameter: ${p.name}` };
      }
    }
  }

  let path = endpoint.path;
  const query = new URLSearchParams();
  const bodyObj: Record<string, unknown> = {};

  for (const p of endpoint.params || []) {
    const loc = inferParamLocation(endpoint, p);
    const raw = values[p.name] ?? "";
    const hasValue = raw.trim().length > 0;

    if (loc === "path") {
      if (hasValue) {
        path = path.replace(`{${p.name}}`, encodeURIComponent(raw));
      }
      continue;
    }

    if (loc === "query") {
      if (hasValue) query.set(p.name, raw);
      continue;
    }

    // body
    if (hasValue) bodyObj[p.name] = coerceValue(p.type, raw);
  }

  const qs = query.toString();
  const url = qs ? `${path}?${qs}` : path;

  const init: RequestInit = {
    method,
    headers: {
      Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
    },
  };

  if (method !== "GET" && method !== "HEAD") {
    init.headers = {
      ...(init.headers || {}),
      "Content-Type": "application/json",
    };
    init.body = JSON.stringify(bodyObj);
  }

  return { url, init };
}

function formatTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function PlaygroundClient({ endpoints, initialSelection }: PlaygroundClientProps) {
  const defaultEndpointId = endpoints[0]?.id;

  const [selectedId, setSelectedId] = useState<string>(defaultEndpointId ?? "");
  const selectedEndpoint = useMemo(
    () => endpoints.find((e) => e.id === selectedId) ?? endpoints[0],
    [endpoints, selectedId]
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ResponseState | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const safe = parsed
        .filter((x) => x && typeof x === "object")
        .slice(0, HISTORY_LIMIT) as RequestHistoryItem[];
      setHistory(safe);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const queryEndpointId = initialSelection?.endpoint;
    const queryPath = initialSelection?.path;
    const queryMethod = initialSelection?.method?.toUpperCase();

    if (queryEndpointId) {
      const matchedById = endpoints.find((endpoint) => endpoint.id === queryEndpointId);
      if (matchedById) {
        setSelectedId((current) => (current === matchedById.id ? current : matchedById.id));
        return;
      }
    }

    if (queryPath) {
      const normalizedQueryPath = normalizeEndpointPath(queryPath);
      const matchedByPath = endpoints.find((endpoint) => {
        const samePath = normalizeEndpointPath(endpoint.path) === normalizedQueryPath;
        if (!samePath) return false;
        if (!queryMethod) return true;
        return endpoint.method.toUpperCase() === queryMethod;
      });

      if (matchedByPath) {
        setSelectedId((current) => (current === matchedByPath.id ? current : matchedByPath.id));
      }
    }
  }, [endpoints, initialSelection]);

  // Initialize param fields when endpoint changes
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const p of selectedEndpoint?.params || []) {
      next[p.name] = "";
    }
    setValues(next);
    setError(null);
    setResponse(null);
  }, [selectedEndpoint]);

  function persistHistory(next: RequestHistoryItem[]) {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  async function sendRequest() {
    if (!selectedEndpoint) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const built = buildRequest(selectedEndpoint, values);
    if (built.error) {
      setLoading(false);
      setError(built.error);
      return;
    }

    const historyItem: RequestHistoryItem = {
      id: (globalThis.crypto && "randomUUID" in globalThis.crypto)
        ? (globalThis.crypto as Crypto).randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      endpointId: selectedEndpoint.id,
      method: selectedEndpoint.method.toUpperCase(),
      url: built.url,
      params: values,
    };

    const t0 = performance.now();
    try {
      const res = await fetch(built.url, { ...built.init, signal: ac.signal });
      const durationMs = Math.round(performance.now() - t0);

      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k] = v;
      });

      const ct = res.headers.get("content-type") || "";
      let body: unknown;
      if (ct.includes("application/json")) {
        body = await res.json().catch(async () => safeJsonParse(await res.text()));
      } else {
        const text = await res.text();
        body = safeJsonParse(text);
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        durationMs,
        url: built.url,
        method: selectedEndpoint.method.toUpperCase(),
      });

      const nextHistory = [{ ...historyItem, status: res.status, ok: res.ok }, ...history]
        .slice(0, HISTORY_LIMIT);
      persistHistory(nextHistory);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);

      const nextHistory = [{ ...historyItem, status: undefined, ok: false }, ...history]
        .slice(0, HISTORY_LIMIT);
      persistHistory(nextHistory);
    } finally {
      setLoading(false);
    }
  }

  function loadFromHistory(item: RequestHistoryItem) {
    setSelectedId(item.endpointId);
    setValues(item.params || {});
    setError(null);
    setResponse(null);
  }

  function clearHistory() {
    persistHistory([]);
  }

  const builtPreview = useMemo(() => {
    if (!selectedEndpoint) return null;
    const built = buildRequest(selectedEndpoint, values);
    return built.error ? { error: built.error } : { url: built.url, method: selectedEndpoint.method.toUpperCase() };
  }, [selectedEndpoint, values]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">API Playground</h1>
          <p className="text-muted-foreground max-w-3xl">
            Pick an endpoint, fill in parameters, and send a live request against the forAgents.dev API (same-origin).
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* History */}
          <aside className="rounded-lg border border-white/10 bg-white/5 p-4 h-fit">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-[#06D6A0]">History</h2>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                disabled={history.length === 0}
              >
                Clear
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No requests yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => {
                  const status = typeof h.status === "number" ? h.status : null;
                  const statusColor = status
                    ? status >= 200 && status < 300
                      ? "text-emerald-400"
                      : status >= 400
                        ? "text-red-400"
                        : "text-amber-400"
                    : "text-slate-400";

                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => loadFromHistory(h)}
                        className="w-full text-left rounded-md border border-white/5 bg-black/20 hover:bg-black/30 transition-colors px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-slate-300 truncate">
                            {h.method} {h.url}
                          </span>
                          <span className={`text-[11px] font-mono ${statusColor}`}>{status ?? "—"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{formatTs(h.ts)}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="endpoint" className="block text-sm font-semibold mb-2 text-[#06D6A0]">
                    Endpoint
                  </label>
                  <select
                    id="endpoint"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0]"
                    value={selectedEndpoint?.id}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {endpoints.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.name} — {ep.method.toUpperCase()} {ep.path}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">{selectedEndpoint?.description}</p>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2 text-[#06D6A0]">Request preview</div>
                  <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                    {builtPreview && "error" in builtPreview ? (
                      <p className="text-xs text-red-400">{builtPreview.error}</p>
                    ) : (
                      <p className="text-xs font-mono text-slate-300">
                        {builtPreview?.method} {builtPreview?.url}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Path params use <span className="font-mono">&#123;name&#125;</span>. Query params are appended automatically.
                  </p>
                </div>
              </div>

              {/* Params */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#06D6A0] mb-3">Parameters</h3>
                {selectedEndpoint?.params?.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedEndpoint.params.map((p) => {
                      const loc = inferParamLocation(selectedEndpoint, p);
                      return (
                        <div key={p.name}>
                          <label className="block text-xs font-semibold text-slate-200 mb-1" htmlFor={`param-${p.name}`}>
                            {p.name}{p.required ? " *" : ""}
                            <span className="ml-2 text-[11px] text-slate-500 font-mono">({loc})</span>
                          </label>
                          <input
                            id={`param-${p.name}`}
                            value={values[p.name] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                            placeholder={p.placeholder}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0]"
                          />
                          {p.description ? (
                            <p className="text-[11px] text-muted-foreground mt-1">{p.description}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No parameters.</p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  onClick={sendRequest}
                  disabled={loading || !selectedEndpoint}
                  className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold"
                >
                  {loading ? "Sending…" : "Send Request"}
                </Button>

                {loading ? (
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-slate-200"
                    onClick={() => abortRef.current?.abort()}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              {error ? (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                  <div className="text-sm font-semibold text-red-400">Error</div>
                  <div className="text-sm text-red-300 mt-1">{error}</div>
                </div>
              ) : null}
            </div>

            {/* Response */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-[#06D6A0] mb-3">Response</h3>

              {!response && !loading ? (
                <p className="text-sm text-muted-foreground">Send a request to see the response.</p>
              ) : null}

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : null}

              {response ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-mono text-slate-300">
                      {response.method} {response.url}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span
                        className={
                          response.status >= 200 && response.status < 300
                            ? "text-emerald-400"
                            : response.status >= 400
                              ? "text-red-400"
                              : "text-amber-400"
                        }
                      >
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-slate-500">{response.durationMs}ms</span>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 mb-2">Headers</div>
                      <pre className="text-[11px] font-mono bg-black/30 p-3 rounded overflow-auto border border-white/5 max-h-[240px]">
                        <code className="text-slate-300">
                          {JSON.stringify(response.headers, null, 2)}
                        </code>
                      </pre>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-200 mb-2">Body</div>
                      <pre className="text-[11px] font-mono bg-black/30 p-3 rounded overflow-auto border border-white/5 max-h-[240px]">
                        <code className="text-slate-300">
                          {typeof response.body === "string"
                            ? response.body
                            : JSON.stringify(response.body, null, 2)}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: This playground uses <span className="font-mono">fetch()</span> from your browser, so cookies, auth, and rate limits apply.
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-[#06D6A0] mb-2">Related Tools</div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/sandbox"
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 text-slate-300 hover:text-white transition-colors"
                >
                  Agent Sandbox →
                </a>
                <a
                  href="/diagnostics"
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 text-slate-300 hover:text-white transition-colors"
                >
                  Diagnostics →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
